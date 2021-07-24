import util
# 日志目录
global logfileDir
logfileDir = './log'
# 数据库配置
global db
db = {
    'host': '127.0.0.1',
    'port': 27017
}
global daliy
daliy = 'daliy'
global daliyxxx
daliyxxx = 'daliy'+util.yesterday().strftime('%Y%m%d')  # daliy20210622
global history
history = 'histest'
global fund
fund = 'fund'


# 基金类型字典
global fundType1
global fundType2
global head1
global head2
fundType1 = {'股票型': '6020-6010', '混合型': '6020-6040',
             '债券型': '6020-6030', 'QDII型': '6020-6050'}
fundType2 = {'货币型': '6020-6020', '短期理财债券型': '6020-6060'}
# 基金代码 分级代码 基金简称 份额净值 累计净值 基金资产净值 估值日期 备注
head1 = ['code', 'subcode',  'shortName', 'shareNetValue',
         'totalNetValue', 'zcNetValue', 'valuationDate']
# 基金代码 分级代码 基金简称 每万份基金已实现收益 7日年化收益率百分比 基金份额净值 基金累计净值 基金资产净值 估值日期 备注
head2 = ['code', 'subcode',  'shortName', 'gainPer', 'yearSevenDayYieldRatePercent',
         'shareNetValue', 'totalNetValue', 'zcNetValue', 'valuationDate']

# db中基金类型定义
global fundTypeDB
fundTypeDB = [
    {'code': '6020-6010', 'name': '股票型'},
    {'code': '6020-6040', 'name': '混合型'},
    {'code': '6020-6030', 'name': '债券型'},
    {'code': '6020-6050', 'name': 'QDII型'},
    {'code': '6020-6020', 'name': '货币型'},
    {'code': '6020-6060', 'name': '短期理财债券型'},
]
