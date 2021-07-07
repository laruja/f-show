# -*- coding:utf-8 -*-
import sys
import re
import time
import logging
from bs4 import BeautifulSoup

import config
import util


class FundCrawler():
    """
    按code取基金基本信息 存入表中
    """

    def __init__(self, k, y):
        self.fundcode = k
        self.p_fund = y

    """
    数据接口 构造url
    """
    # 基金档案 基本信息
    __interface_basic = 'http://fundf10.eastmoney.com/jbgk_%s.html'
    # 基金经理
    __interface_manager = 'http://fundf10.eastmoney.com/jjjl_%s.html'
    # 资产配置
    __interface_zcpz = 'http://fundf10.eastmoney.com/zcpz_%s.html'
    # 持有人结构
    __interface_cyrjg = 'http://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=cyrjg&code=%s'
    # 行业配置 http://fundf10.eastmoney.com/hytz_519732.html
    # http://api.fund.eastmoney.com/f10/HYPZ/?fundCode=519732&year=&callback=jQuery18300498687738752952_1620113642720&_=1620113643107

    def crawl_all(self):
        fund_cursor = self.p_fund.find({'code': self.fundcode})
        if len(list(fund_cursor)) > 0:
            logging.info('数据库中已存在该基金，不需要重复抓取！基金代码 : %s' % (self.fundcode))
        else:
            """
            抓取所有基金数据
            """
            data_basic = self.crawl_basic()
            data_manager = self.crawl_manager()
            data_zcpz = self.crawl_zcpz()
            data_cyrjg = self.crawl_cyrjg()
            data = {
                'code': self.fundcode,
                'basic': data_basic,
                'managers': data_manager,
                'zcpz': data_zcpz,
                'cyrjg': data_cyrjg,
            }
            logging.info('即将存入%s: ' % (data))

            # # data元组不为空 保存当前code所有数据
            if data:
                data['createDate'] = util.current
                # 保存数据到数据库
                result = self.p_fund.insert_one(data)
                # 记录入库开始时间
                logging.info('code %s存入数据库' % (self.fundcode))

    def crawl_cyrjg(self):
        """
        持有人结构
        """
        url = self.__interface_cyrjg % (self.fundcode)
        logging.info('基金代码%s， ' % (self.fundcode))
        # 抓取第一页数据
        html = util.fetch_page(logging, url)
        # 解析数据
        phObj = self.parse_html_cyrjg(html)
        data = phObj['obj']
        logging.info('持有人结构 %s: ' % (data))

        return data

    def parse_html_cyrjg(self, html):
        """
        解析html 持有人结构
        """
        # 将html传入BeautifulSoup 的构造方法,得到一个文档的对象
        soup = BeautifulSoup(html, 'html.parser')
        # 基本概况
        # 标题  table标签下tr下th标签
        titlelist = soup.select("table > thead th ")
        # logging.info('基本信息 titlelist %s: ' % (titlelist))
        titles = [item.get_text() for item in titlelist]
        logging.info('持有人结构 %s: ' % (titles))

        # 内容  txt_in类下 table标签下tr下td标签
        contentlabellist = soup.select("table > tbody td ")
        logging.info('持有人结构 contentlabellist %s: ' % (contentlabellist))

        # 目标数据存储列表
        datalist = []
        # 内容列表
        contents = []
        for index, item in enumerate(contentlabellist):

            # 每5条zip保存
            if index != 0 and (index % 5 == 0 or index == len(contentlabellist)-1):
                # if (index % 5 == 0 or index == len(contentlabellist)-1):
                contents.append(item.get_text())
                data = zip(titles, contents)
                data = dict(data)
                # data不为空
                datalist.append(data)
                contents = []
            contents.append(item.get_text())

        logging.info('持有人结构 %s: ' % (datalist))

        return {'obj': datalist}

    def crawl_zcpz(self):
        """
        资产配置
        """
        url = self.__interface_zcpz % (self.fundcode)
        logging.info('基金代码%s， ' % (self.fundcode))
        # 抓取第一页数据
        html = util.fetch_page(logging, url)
        # 解析数据
        phObj = self.parse_html_zcpz(html)
        data = phObj['obj']
        logging.info('基本信息%s: ' % (data))

        return data

    def parse_html_zcpz(self, html):
        """
        解析html 资产配置
        """
        # 将html传入BeautifulSoup 的构造方法,得到一个文档的对象
        soup = BeautifulSoup(html, 'html.parser')
        # 基本概况
        # 标题  txt_in类下 table标签下tr下th标签
        titlelist = soup.select(
            ".box.nb > .boxitem > table > thead > tr > th ")
        # logging.info('基本信息 titlelist %s: ' % (titlelist))
        # bug--会得到th下所有内容包括子标签文本内容
        titles = [item.get_text() for item in titlelist]
        logging.info('资产配置%s: ' % (titles))

        # 内容  txt_in类下 table标签下tr下td标签
        contentlabellist = soup.select(
            ".box.nb > .boxitem > table > tbody td ")
        logging.info('资产配置 contentlabellist %s: ' % (contentlabellist))

        # 目标数据存储列表
        datalist = []
        # 内容列表
        contents = []
        for index, item in enumerate(contentlabellist):
            # 每5条zip保存
            if index != 0 and (index % 5 == 0 or index == len(contentlabellist)-1):
                contents.append(item.get_text())
                data = zip(titles, contents)
                data = dict(data)
                # data不为空
                datalist.append(data)
                contents = []
            contents.append(item.get_text())

        logging.info('资产配置 %s: ' % (datalist))

        return {'obj': datalist}

    def crawl_basic(self):
        """
        抓取基本档案数据
        """
        url = self.__interface_basic % (self.fundcode)
        logging.info('基金代码%s， ' % (self.fundcode))

        # 抓取第一页数据
        html = util.fetch_page(logging, url)
        logging.info('基本信息html%s: ' % (html))

        # 解析数据
        phObj = self.parse_html_basic(html)
        data = phObj['obj']
        logging.info('基本信息%s: ' % (data))

        return data

    def parse_html_basic(self, html):
        """
        解析html
        """
        # 将html传入BeautifulSoup 的构造方法,得到一个文档的对象
        soup = BeautifulSoup(html, 'html.parser')

        # 基本概况
        # 标题  txt_in类下 table标签下tr下th标签
        titlelist = soup.select(".txt_in table th ")
        titles = [item.get_text() for item in titlelist]

        # 内容  txt_in类下 table标签下tr下td标签
        contentlist = soup.select(".txt_in table td ")
        contents = [item.get_text() for item in contentlist]
        logging.info('档案基本信息 contents %s: ' % (contents))

        # 打包元组
        data = zip(titles, contents)
        data = dict(data)
        data['基金代码'] = re.findall('\d+', data['基金代码'])[0]

        # 盘中估算
        # gs = soup.select("#fund_gsz")[0].get_text()
        # print('估算：',gs)
        # # 盘中估算涨幅
        # gszf = soup.select("#fund_gszf")[0].get_text()
        # print('估算涨幅： ',gszf)

        return {'obj': data}

    def crawl_manager(self):
        """
        抓取基金经理数据
        """
        url = self.__interface_manager % (self.fundcode)
        logging.info('基金代码%s， ' % (self.fundcode))

        # 抓取第一页数据
        html = util.fetch_page(logging, url)
        # 解析数据
        phObj = self.parse_html_manager(html)
        data = phObj['obj']
        logging.info('基金经理%s: ' % (data))

        return data

    def parse_html_manager(self, html):
        """
        解析html 基金经理
        """
        # 将html传入BeautifulSoup 的构造方法,得到一个文档的对象
        soup = BeautifulSoup(html, 'html.parser')
        # 基本概况
        # 标题  txt_in类下 table标签下tr下th标签
        titlelist = soup.select(".txt_in > .box > .boxitem > table th ")
        # logging.info('基本信息 titlelist %s: ' % (titlelist))
        titles = [item.get_text() for item in titlelist]
        # logging.info('基本信息titles %s: ' % (titles))

        # 内容  txt_in类下 table标签下tr下td标签
        contentlabellist = soup.select(
            ".txt_in > .box > .boxitem > table > tbody td ")
        # logging.info('基本信息contentlabellist %s: ' % (contentlabellist))

        # 目标数据存储列表
        datalist = []
        # 内容列表
        contents = []
        for index, item in enumerate(contentlabellist):
            # 每5条zip保存
            if index != 0 and (index % 5 == 0 or index == len(contentlabellist)-1):
                contents.append(item.get_text())
                data = zip(titles, contents)
                data = dict(data)
                datalist.append(data)
                contents = []

            contents.append(item.get_text())

        logging.info('基金经理%s: ' % (datalist))

        return {'obj': datalist}


if __name__ == '__main__':
    # nodejs传进来的数组
    fundcodes = sys.argv[1].split(',')

    # 记录日志 -*- coding:utf-8 -*-
    logfilename = '%s/fund_info_%s.log' % (config.logfileDir, fundcodes)
    logging.basicConfig(filename=logfilename,
                        level=logging.DEBUG, format='%(asctime)s %(message)s')
    # 数据库
    db = util.connect_db()
    p_fund = db[config.fund]

    for index, code in enumerate(fundcodes):
        # print('🍊 ', code)
        crawler = FundCrawler(code, p_fund)
        # 记录开始爬取时间
        logging.debug('开始爬取')
        crawler.crawl_all()
        # 记录爬取结束时间
        logging.debug('完成爬取')
        print('基金详情抓取完毕！')

# 测试命令  python3 fund2db_basic1code.py
