module.exports = {
  /**
   * sheet(table) 的类型
   * 影响输出json的类型
   * 当有#id类型的时候  表输出json的是map形式(id:{xx:1})
   * 当没有#id类型的时候  表输出json的是数组类型 没有id索引
   */
  SheetType: {
    /**
     * 普通表 
     * 输出JSON ARRAY
     */
    NORMAL: 0,

    /**
     * 有主外键关系的主表
     * 输出JSON MAP
     */
    MASTER: 1,

    /**
     * 有主外键关系的附表
     * 输出JSON MAP
     */
    SLAVE: 2
  },

  /**
   * 支持的数据类型
   */
  DataType: {
    NUMBER: 'number',
    STRING: 'string',
    BOOL: 'bool',
    DATE: 'date',
    ID: 'id',
    IntID: 'intid',
    IDS: 'id[]',
    IntIDS: 'intid[]',
    ARRAY: '[]',
    OBJECT: '{}',
    INT32: 'int',
    INT64: 'int64',
    FLOAT: 'float',
    INT32_ARRAY: 'int[]',
    INT64_ARRAY: 'int64[]',
    FLOAT_ARRAY: 'float[]',
    BOOL_ARRAY: 'bool[]',
    STRING_ARRAY: 'string[]',
    UNKNOWN: 'unknown'
  }

};