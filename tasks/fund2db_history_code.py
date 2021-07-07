# -*- coding:utf-8 -*-
import sys
import math
import re
import time
import logging
from bs4 import BeautifulSoup

import config
import util


class FundCrawler():
    """
    抓取不存在于history表中的多只基金净值数据，保存到mongodb中
    """
    def __init__(self, k, x, y):
        self.fundcode = k
        self.p_daliy = x
        self.p_history = y

    """
    数据接口
    """
    __interface = 'http://eid.csrc.gov.cn/fund/web/list_net_classification.daily_report?1=1&fundCode=%s&classification=%s&limit=20&start=%s'

    def crawl_all(self):
        """
        抓取所有基金数据
        """
        # 查history中是否有该code 没有则抓取
        his_cursor = self.p_history.find({'code': self.fundcode})
        if len(list(his_cursor)) > 0:
            logging.info('数据库中已存在该基金，不需要重复抓取！基金代码 : %s' % (self.fundcode))
        else:
            param = self.get_interface_param(self.fundcode)
            url = self.__interface % (
                param['fundCode'], param['classification'], 0)
            logging.info('首页url : %s' % (url))

            data = []
            # 抓取第一页数据
            html = util.fetch_page(logging, url)
            # fetch_page 返回有误则增加间隔重查
            fetch_i = 1
            while html == '':
                fetch_i += 1
                if fetch_i > 20:
                    time.sleep(1)
                else:
                    time.sleep(0.5)
                html = util.fetch_page(logging, url)

            # 解析数据
            # 找到daliy表中该基金详情
            fundinfo = list(self.p_daliy.find({'code': self.fundcode}))[0]
            logging.info('基金代码%s 存在于daliy的数据 %s' % (self.fundcode, fundinfo))

            phObj = self.parse_html(html, fundinfo)
            data += phObj['data']
            # 总条数
            num = phObj['num']
            # 总页数
            page = math.ceil(int(num)/20)
            # 记录
            logging.info('基金代码%s 总共%s条， %s页' % (self.fundcode, num, page))
            # print('基金代码%s 总共%s条， %s页' % (fundcode, num, page))
            # 第num页

            n = 1
            while n < int(page):
                url = self.__interface % (
                    param['fundCode'], param['classification'], n*20)

                # 处理第n页数据并获取总页数
                html = util.fetch_page(logging, url)

                # fetch_page 返回有误则增加间隔重查
                fetch_ii = 1
                while html == '':
                    fetch_ii += 1
                    if fetch_ii > 20:
                        time.sleep(5)
                    else:
                        time.sleep(2)
                    html = util.fetch_page(logging, url)
                phObj = self.parse_html(html, fundinfo)

                data += phObj['data']
                time.sleep(0.5)  # 0.5秒抓一页
                if n % 10 == 0:  # 每10页显示一个进度
                    print('[第%s/%s页]' % (n, page))
                else:
                    print('.', end=' ', flush=True)
                n += 1
            # 保存当前code所有数据
            # logging.info('历史净值数据 %s: ' % (data))
            if len(data) > 0:
                # 保存数据到数据库
                result = p_history.insert_many(data)
                # 记录入库开始时间
                logging.info('code%s存入数据库 ，共%s条' % (self.fundcode, len(data)))
            else:
                logging.info('0条历史净值数据,%s数据库没有新增数据', config.history)

    def get_interface_param(self, code):
        # 找到当前code对应的idStr
        fund_ori = list(self.p_daliy.find({'code': code}))
        idStr = fund_ori[0]['idStr']
        classification = fund_ori[0]['classification']
        # print(idStr,classification)
        fund_target = list(self.p_daliy.aggregate([
            {"$match": {"idStr": idStr}},
            {"$group": {"_id": {"idStr": "$idStr"},
                        "code": {"$push": "$code"},
                        "classification": {"$push": "$classification"},
                        "type": {"$push": "$type.code"},
                        "shortName": {"$push": "$shortName"}
                        }
             }
        ]))
        fundCode = fund_target[0]['code'][0]
        return {'idStr': idStr, 'classification': classification, 'fundCode': fundCode}

    def parse_html(self, html, fund):
        """
        解析html
        """
        # logging.warning('html %s: ' % (html))
        # 将html传入BeautifulSoup 的构造方法,得到一个文档的对象
        soup = BeautifulSoup(html, 'html.parser')
        # 解析总条数
        numTd = soup.select("#con_one_1 tr > td ")[1]
        numstr = re.findall('\d+', numTd.get_text())[2]
        # 解析数据
        tds = soup.select(".cc ~ tr > td ")  # cc类所有兄弟节点下的所有td
        # logging.warning('html的td %s: ' % (tds))

        datalist = []  # 文档目标数据存储列表
        # 每条数据列表
        dtemp = []

        # [股票型 混合型 债券型 QDII型] PK [货币型 短期理财债券型] 返回的字段不同
        ftype = fund['type']
        idStr = fund['idStr']

        if ftype['name'] in config.fundType1:
            head = config.head1
        elif ftype['name'] in config.fundType2:
            head = config.head2
        else:
            logging.warning('未定义的类型 %s' % (fund))
            return

        # 将列表转字典
        for key in tds:
            # logging.warning('%s tds的key %s' % (key, key.get_text()))
            # logging.info(key.get_text())

            # if key.get_text() == ' \n':
            if key.get_text() == ' ':
                data = zip(head, dtemp)
                ddict = dict(data)

                # 过滤无效数据
                if self.is_valid_data(ftype['name'], ddict):
                    # 添加创建日期
                    ddict['createDate'] = util.current
                    # 添加type类型 idStr小类
                    ddict['type'] = ftype
                    ddict['idStr'] = idStr
                    datalist.append(ddict)

                dtemp = []
                continue
            else:
                dtemp.append(key.get_text())  # 保存数据到列表中

        # logging.warning('去subcode前datalist  %s' % (datalist))

        # 去subcode
        datalist = self.column_clean(datalist)
        return {'num': numstr, 'data': datalist}

    def column_clean(self, datalist):
        """ 
        合并code&subcode 
        """
        targetlist = []

        for item in datalist:
            funddict = {
                'createDate': '',
                'zcNetValue': '',
                'valuationDate': '',
                'type': {'code': '', 'name': ''},
                'idStr': '',
                'shortName': '',
                'code': '',
                'shareNetValue': '', 'totalNetValue': '',
                'gainPer': '', 'yearSevenDayYieldRate': '', 'yearSevenDayYieldRatePercent': ''
            }
            if item['subcode'] != '-':
                funddict['code'] = item['subcode']
            else:
                funddict['code'] = item['code']

            funddict['createDate'] = item['createDate']
            funddict['zcNetValue'] = item['zcNetValue']
            funddict['valuationDate'] = item['valuationDate']
            funddict['type']['code'] = item['type']['code']
            funddict['type']['name'] = item['type']['name']
            funddict['idStr'] = item['idStr']
            funddict['shortName'] = item['shortName']

            funddict['shareNetValue'] = item['shareNetValue']
            funddict['totalNetValue'] = item['totalNetValue']

            if 'gainPer' in item:
                funddict['gainPer'] = item['gainPer']
            if 'yearSevenDayYieldRatePercent' in item:
                funddict['yearSevenDayYieldRatePercent'] = item['yearSevenDayYieldRatePercent']
            if 'yearSevenDayYieldRatePercent' in item:
                funddict['yearSevenDayYieldRate'] = float(
                    item['yearSevenDayYieldRatePercent'].strip('%'))/100
            targetlist.append(funddict)  # 或targetlist += [funddict]
        return targetlist

    def is_valid_data(self, typename, htmldatadict):
        is_valid = False
        if typename in config.fundType1 and self.equal_type1_filter_condition(htmldatadict):
            is_valid = True
        if typename in config.fundType2 and self.equal_type2_filter_condition(htmldatadict):
            is_valid = True
        return is_valid

    def equal_type1_filter_condition(self, htmldatadict):
        return (htmldatadict['shareNetValue'] != '' or htmldatadict['zcNetValue'] != '')

    def equal_type2_filter_condition(self, htmldatadict):
        return (htmldatadict['shareNetValue'] != '' or htmldatadict['gainPer'] != '' or htmldatadict['yearSevenDayYieldRate'] != '' or htmldatadict['zcNetValue'] != '')


if __name__ == '__main__':

    date = util.yesterday()

    db = util.connect_db()
    # 指定操作的集合 type:collection  daliy
    p_daliy = db[config.daliy]
    p_history = db[config.history]

    # nodejs传进来的数组
    fundcodes = sys.argv[1].split(',')  # 多只基

    print('😄', fundcodes)

    # 记录日志 -*- coding:utf-8 -*-
    logfilename = '%s/fundhistory_%s.log' % (config.logfileDir, fundcodes)
    logging.basicConfig(filename=logfilename,
                        level=logging.DEBUG, format='%(asctime)s %(message)s')
    for index, code in enumerate(fundcodes):
        crawler = FundCrawler(code, p_daliy, p_history)
        # 记录开始爬取时间
        logging.info('开始爬取%s', code)
        crawler.crawl_all()
        # 记录爬取结束时间
        logging.info('完成爬取%s', code)
    print('history ok')
