import json
import time
import math
import socket
import logging
from urllib import request
from urllib import error

import config
import util

print('daliy fund to db ⛽️')


class FundCrawler():
    """
    抓取数据 并保存有效值
    """

    def __init__(self, x, y):
        self.date = x
        self.p_daliyxxx = y
        print('crawl init👏')
    # 基金类型字典
    _fund_type1 = config.fundType1
    _fund_type2 = config.fundType2

    # 数据接口
    __interface_targeturl = 'http://eid.csrc.gov.cn/fund/disclose/getPublicFundJZInfoMore.do?aoData=%5B%7B%22name%22%3A%22sEcho%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22iColumns%22%2C%22value%22%3A5%7D%2C%7B%22name%22%3A%22sColumns%22%2C%22value%22%3A%22%2C%2C%2C%2C%22%7D%2C%7B%22name%22%3A%22iDisplayStart%22%2C%22value%22%3A{iDisplayStart}%7D%2C%7B%22name%22%3A%22iDisplayLength%22%2C%22value%22%3A20%7D%2C%7B%22name%22%3A%22mDataProp_0%22%2C%22value%22%3A%22fund%22%7D%2C%7B%22name%22%3A%22mDataProp_1%22%2C%22value%22%3A%22fund%22%7D%2C%7B%22name%22%3A%22mDataProp_2%22%2C%22value%22%3A%22fund%22%7D%2C%7B%22name%22%3A%22mDataProp_3%22%2C%22value%22%3A%22fund%22%7D%2C%7B%22name%22%3A%22mDataProp_4%22%2C%22value%22%3A%22valuationDate%22%7D%2C%7B%22name%22%3A%22fundType%22%2C%22value%22%3A%22{fundType}%22%7D%2C%7B%22name%22%3A%22fundCompanyShortName%22%2C%22value%22%3A%22%22%7D%2C%7B%22name%22%3A%22fundCode%22%2C%22value%22%3A%22%22%7D%2C%7B%22name%22%3A%22fundName%22%2C%22value%22%3A%22%22%7D%2C%7B%22name%22%3A%22startDate%22%2C%22value%22%3A%22{startDate}%22%7D%2C%7B%22name%22%3A%22endDate%22%2C%22value%22%3A%22{endDate}%22%7D%5D'
    # 数据列表
    _datalist = []

    def crawl_all(self):
        """
        抓取所有类型数据
        """
        for key in self._fund_type1:
            logging.warning('开始抓取%s' % (key))
            # 阶段性保存数据到文件中
            self._datalist += self.crawl_type(self._fund_type1, key)
        for key in self._fund_type2:
            logging.warning('开始抓取%s' % (key))
            self._datalist += self.crawl_type(self._fund_type2, key)

        if len(self._datalist) > 0:
            logging.warning('处理前 %s  ', len(self._datalist))
            funddatas = util.parse_datalist(self._datalist)
            # 保存数据到数据库
            logging.warning('开始入daliy库')
            logging.warning('清洗后 %s ', len(funddatas))
            result = self.p_daliyxxx.insert_many(funddatas)
            logging.warning('入库完毕! 共%s条数据', len(funddatas))
        else:
            logging.warning('0条数据，没有入库')

    def crawl_type(self, type, key):
        """
        抓取一个类型数据
        """
        datatype = []
        idisplay_start = 0

        while True:
            urldata = self.__interface_targeturl.format(
                iDisplayStart=idisplay_start, fundType=type[key], startDate=self.date, endDate=self.date)

            dataobj = util.fetch_page(logging, urldata)

            # 出现网络异常则增加间隔重查
            i = 1
            while dataobj == '':
                i += 1
                if i > 10:
                    time.sleep(5)
                else:
                    time.sleep(2)

                dataobj = util.fetch_page(logging, urldata)

            dataobj = util.parse_data(dataobj)
            if dataobj == '':
                # print('不是json')
                logging.warning('不是json %s' % (dataobj))
                break

            if idisplay_start == 0:
                # print('共%s条 %s页' % (dataobj['iTotalRecords'], math.ceil(dataobj['iTotalRecords']/20)))
                logging.warning('共%s条 %s页' % (
                    dataobj['iTotalRecords'], math.ceil(dataobj['iTotalRecords']/20)))
            # 净值数据
            datatype += dataobj['aaData']
            # 时间间隔
            time.sleep(0.5)
            idisplay_start += 20

            # 显示进度
            page = int(idisplay_start/20)
            print('.%s页' % (page), end=' ', flush=True)
            if len(dataobj['aaData']) < 20:
                # print('共%s页' % (page))
                logging.warning('共%s页' % (page))
                break
        return datatype


class Daliy2History():
    """
    将daliy表中code存在于history表中的数据 保存到history表中
    """

    def __init__(self, x, y, z):
        # print('Daliy2History init👏')
        self.date = x
        self.p_daliyxxx = y
        self.p_history = z

    def process(self):
        # 查history表中的code
        his_codes = self.p_history.distinct('code')
        logging.warning('his_codes: %s', his_codes)
        daliy = self.p_daliyxxx.find({'code': {'$in': his_codes}})
        daliy_list = list(daliy)
        if len(daliy_list) > 0:
            result = self.p_history.insert_many(daliy_list)
            logging.info('daliy存入历史表完成: %s', daliy_list)
        else:
            logging.info('当前history表无新增数据')


class DaliyXXX2Daliy():
    """
    daliy表仅保存上一日数据
    将每日净值数据 保存到'daliy'表中
    """

    def __init__(self, x, y):
        self.p_daliyxxx = x
        self.p_daliy = y

    def save(self):
        p_daliyxxx = self.p_daliyxxx.find({})
        daliyxxx_list = list(p_daliyxxx)
        # logging.warning('daliyxxx: %s', daliyxxx_list)
        if len(daliyxxx_list) > 0:
            # 清空daliy表数据
            self.p_daliy.delete_many({})  # 推荐delete_many 替代remove({})
            result = self.p_daliy.insert_many(daliyxxx_list)


if __name__ == '__main__':

    # date = '2021-04-23'  # 周六周日没有新数据
    date = util.yesterday()
    # 连接数据库
    db = util.connect_db()
    p_daliyxxx = db[config.daliyxxx]  # 指定操作的集合 type:collection  daliy20210426
    p_history = db[config.history]

    logfilename = '%s/funddaliy%s.log' % (config.logfileDir, date)
    logging.basicConfig(filename=logfilename,
                        level=logging.DEBUG, format='%(asctime)s %(message)s')
    logging.warning('😊 开始 🍎')

    if p_daliyxxx and p_daliyxxx.estimated_document_count() == 0:
        # 抓取daliy数据
        d2d = FundCrawler(date, p_daliyxxx)
        logging.warning('开始抓取[%s]', date)
        d2d.crawl_all()
    else:
        logging.warning('%s表已有数据，不需要重复抓取', config.daliyxxx)

    logging.warning('😊daliyxxx表 完成 ✅ : %s', config.daliyxxx)
    d2h = Daliy2History(date, p_daliyxxx, p_history)
    d2h.process()
    logging.warning('😊history表 完成 ✅ : %s', config.history)
    p_daliy = db[config.daliy]
    d2d = DaliyXXX2Daliy(p_daliyxxx, p_daliy)
    d2d.save()
    logging.warning('😊daliy表 完成 ✅ : %s', config.daliy)
