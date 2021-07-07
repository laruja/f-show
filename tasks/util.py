import config
import pymongo
import datetime
import time
import json
from urllib import request
from urllib import error
import socket

global connect_db
global today
global yesterday
global parse_data


def connect_db():
    """
    连接数据库 指定集合
    """
    # print(pymongo.version)
    # 建立连接 python自带的pymongo库
    client = pymongo.MongoClient(
        host=config.db['host'], port=config.db['port'])
    # 选择数据库 数据库连接
    db = client.testfund  # client['testfund']
    # 关闭数据库连接
    # client.close()
    return db


# 格式：20210423
today = time.strftime('%Y%m%d', time.localtime())
# 当前时间，格式：'2021-06-15 09:15:18'
current = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())


def yesterday():
    """
    获取昨日
    格式：2021-06-10
    """
    today = datetime.date.today()
    oneday = datetime.timedelta(days=1)
    # oneday = datetime.timedelta(days=3)
    yesterday = today-oneday
    return yesterday


def is_json(jstr):
    """
    判断是否是json
    """
    try:
        json_object = json.loads(jstr)
    except ValueError as e:
        return False
    return True


def parse_data(data):
    """
    解析数据
    容错处理：如果data不是json则返回空，等待数据返回完整再处理
    """
    if is_json(data):
        return json.loads(data)
    else:
        return ''


def fetch_page(logging, url):
    """
    抓取单页数据
    """
    logging.info('url:  %s ' % (url))
    req = request.Request(url)
    # 捕获异常 记录到log中
    try:
        res = request.urlopen(req)
    except error.HTTPError as e:
        # print('The server couldn\'t fulfill the request.')
        # print('Error code: ', e.code)
        # print(e.reason)
        logging.error('%s ,--url: %s' % (e.reason, url))
        return ''
    except error.URLError as e:
        # print('We failed to reach a server.')
        # print('Reason: ', e.reason)
        logging.error('%s ,--url: %s' % (e.reason, url))
        return ''
    except socket.timeout as e:
        # print(e)
        logging.error('%s ,--url: %s' % (e, url))
        return ''
    except error as e:
        # print(e)
        logging.error('%s ,--url: %s' % (e, url))
        return ''
    try:
        result = res.read().decode(encoding='utf-8')
    except Exception as e:
        # print(e)
        logging.error('%s ,--url: %s' % (e, url))
        return ''
    return result


def get_typename(code):
    """
    通过类型code获取类型名称
    """
    code_name_dict = transform_fundType()
    name = code_name_dict[code]
    return name


def transform_fundType():
    """
    转换定义的类型字典
    """
    alltype = dict(config.fundType1, **config.fundType2)  # 字典合并
    code_name_dict = dict(
        zip(alltype.values(), alltype.keys()))  # 字典 key value互换
    return code_name_dict


def parse_datalist(datalist):
    """
    数据清洗--daliy表结构
    """
    targetlist = []
    for item in datalist:
        funddict = {
            'createDate': '',
            'zcNetValue': '',
            'valuationDate': '',
            'classification': '',
            'type': {'code': '', 'name': ''},
            'idStr': '',
            'shortName': '',
            'code': '',
                    'shareNetValue': '', 'totalNetValue': '',
                    'gainPer': '', 'yearSevenDayYieldRate': '', 'yearSevenDayYieldRatePercent': ''
        }  # 此处初始化！
        # 判断是否有 totalNetValue 或者 gainPer 没有则不保存，有则存入list
        if 'totalNetValue' in item or 'gainPer' in item:
            funddict['createDate'] = current
            funddict['zcNetValue'] = ''
            funddict['valuationDate'] = item['valuationDate']
            funddict['classification'] = item['classification']['code']
            funddict['type']['code'] = item['fund']['fundType']['code']
            funddict['type']['name'] = get_typename(
                item['fund']['fundType']['code'])
            funddict['idStr'] = item['fund']['idStr']
            funddict['shortName'] = item['shortName']
            funddict['code'] = item['code']
            if 'shareNetValue' in item:
                funddict['shareNetValue'] = item['shareNetValue']
            # else:
            #     funddict['shareNetValue'] = ''

            if 'totalNetValue' in item:
                funddict['totalNetValue'] = item['totalNetValue']
            # else:
            #     funddict['totalNetValue'] = ''

            if 'gainPer' in item:
                funddict['gainPer'] = item['gainPer']
            # else:
            #     funddict['gainPer'] = ''

            if 'yearSevenDayYieldRate' in item:
                funddict['yearSevenDayYieldRate'] = item['yearSevenDayYieldRate']
            # else:
            #     funddict['yearSevenDayYieldRate'] = ''

            if 'yearSevenDayYieldRatePercent' in item:
                funddict['yearSevenDayYieldRatePercent'] = item['yearSevenDayYieldRatePercent']
            # else:
            #     funddict['yearSevenDayYieldRatePercent'] = ''

            # 三目运算
            """ funddict['shareNetValue'] = item['shareNetValue'] if 'shareNetValue' in item else funddict['shareNetValue'] = ''
            funddict['totalNetValue'] = item['totalNetValue'] if 'totalNetValue' in item else funddict['totalNetValue'] = ''
            funddict['zcNetValue'] = ''
            funddict['gainPer'] = item['gainPer'] if 'gainPer' in item else funddict['gainPer'] = ''
            funddict['yearSevenDayYieldRate'] = item['yearSevenDayYieldRate'] if 'yearSevenDayYieldRate' in item else funddict['yearSevenDayYieldRate'] = ''
            funddict['yearSevenDayYieldRatePercent'] = item['yearSevenDayYieldRatePercent'] if 'yearSevenDayYieldRatePercent' in item else funddict['yearSevenDayYieldRatePercent'] = ''
            """
            targetlist.append(funddict)  # 或targetlist += [funddict]

        # else:
            # print('无效数据 %s', item)
    return targetlist
