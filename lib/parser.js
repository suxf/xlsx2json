const config = require('../config.json');
const types = require('./types');
var _ = require('lodash');
const utility = require('./utility');

const DataType = types.DataType;
const SheetType = types.SheetType;

const headIndex = 2;// 表头所在的行，第一行是描述，第二行是表头, 请不要修改低于2

/**
 * 解析workbook中所有sheet的设置
 * @param {*} workbook 
 */
function parseSettings(workbook, flag) {

    /**
     * settings's schema
     * {
        type: SheetType.NORMAL,
        head: [{
            name: "json-key(column name)",
            type: "number/string/bool/data/id/[]/{}",
          }]
        ,
        slaves: [],
        master: {
          name: '',
          type: DataType.OBJECT
        },
      } 
     */

    let settings = {};

    for (sheet of workbook) {
        // 正则移除sheet名中的()和括号中内容，以及空格
        sheet.name = sheet.name.replace(/(\(.*\))|(\s*)/g, '');

        //叹号开头的sheet不输出
        if (sheet.name.startsWith(config.xlsx.ignore_prefix_symbol)) {
            continue;
        }

        // 标记为真 且列名以 _ 开头则导出dest1 不导出dest2 
        if (flag && sheet.name.startsWith(config.xlsx.only_export_server_prefix)) {
            continue;
        }
        if (sheet.name.startsWith(config.xlsx.only_export_server_prefix)) sheet.name = sheet.name.replace(config.xlsx.only_export_server_prefix, '');

        let slave = sheet.name.indexOf('@') >= 0;
        let sheet_name = sheet.name;
        let head_desc_row = sheet.data[0];

        let sheet_setting = {
            type: SheetType.NORMAL,
            master: null,
            slaves: [],
            head: [],
            desc: head_desc_row[0] ?? '',
            vertical: false,
            // dataLength: sheet.data.length - headIndex,
        };

        // 如果描述行的第一个字符是#，则表示这个表是纵向表
        sheet_setting.vertical = sheet_setting.desc.startsWith('#');
        if (sheet_setting.vertical) {
            // 去掉描述行的第一个字符
            sheet_setting.desc = sheet_setting.desc.substring(1);

            // 假设 sheet.data 是一个二维数组，第一行为表头
            const data = [];

            // 处理表头
            const headers = sheet.data[0];
            for (let j = 0; j < headers.length; j++) {
                data[j] = [headers[j]]; // 初始化每列的数组，并将表头放入
            }

            // 处理数据行
            for (let k = 1; k < sheet.data.length; k++) {
                let row = sheet.data[k];
                for (let j = 0; j < row.length; j++) {
                    data[j].push(row[j]); // 将每行数据添加到对应的列
                }
            }
            sheet.data = data;
            head_desc_row = sheet.data[0];
            // sheet_setting.dataLength = sheet.data.length - headIndex;
        }

        let head_row = sheet.data[headIndex - 1];

        if (head_row == undefined) continue;

        //parsing head setting
        for (let i = 0; i < head_row.length; ++i) {
            let cell = head_row[i];
            if (cell == null || cell == '') {
                cell = config.xlsx.ignore_prefix_symbol;
            }
            let cell_desc = head_desc_row[i];

            let head_setting = {
                name: cell,
                type: DataType.UNKNOWN,
                detect: false, // 是否自动检测类型
                desc: cell_desc,
            };

            if (cell.indexOf('#') !== -1) {
                let pair = cell.split('#');
                let name = pair[0].trim();
                let type = pair[1].trim();

                head_setting.name = name;

                if (!cell.startsWith(config.xlsx.ignore_prefix_symbol)) {
                    head_setting.type = type;
                }

                if (!slave && (type === DataType.ID || type === DataType.IntID)) {
                    sheet_setting.type = SheetType.MASTER;
                    if (type === DataType.ID) sheet_setting.id_type = 'string';
                    else if (type === DataType.IntID) sheet_setting.id_type = 'int';
                }
            } else {
                for (let j = headIndex; j < sheet.data.length; j++) {
                    let row = sheet.data[j][i];
                    if (row == null || row === '') {
                        continue;
                    }
                    var row_type = utility.detectType(row);
                    if (head_setting.type === DataType.UNKNOWN) {
                        if (row_type === DataType.BOOL || row_type === DataType.NUMBER || row_type === DataType.STRING) {
                            head_setting.type = row_type;
                            head_setting.detect = true; // 标记为自动检测类型
                            continue;
                        }
                    } else if (head_setting.type === DataType.NUMBER) {
                        if (row_type === DataType.STRING || row_type === DataType.BOOL) {
                            head_setting.type = DataType.STRING;
                            head_setting.detect = true; // 标记为自动检测类型
                            break;
                        }
                    } else if (head_setting.type === DataType.BOOL) {
                        if (row_type === DataType.STRING || row_type === DataType.NUMBER) {
                            head_setting.type = DataType.STRING;
                            head_setting.detect = true; // 标记为自动检测类型
                            break;
                        }
                    } else if (head_setting.type === DataType.STRING) {
                        if (row_type != DataType.STRING) continue;
                        if (row.startsWith('{') && row.endsWith('}')) {
                            head_setting.type = DataType.OBJECT;
                            head_setting.detect = true; // 标记为自动检测类型
                            break;
                        } else if (row.startsWith('[') && row.endsWith(']')) {
                            head_setting.type = DataType.ARRAY;
                            head_setting.detect = true; // 标记为自动检测类型
                            break;
                        } else {
                            break; // 如果已经确定了类型，则不再继续检测
                        }
                    }
                }
            }
            sheet_setting.head.push(head_setting);
        }

        if (slave) {
            sheet_setting.type = SheetType.SLAVE;
            let pair = sheet_name.split('@');
            sheet_name = pair[0].trim();
            sheet_setting.master = pair[1].trim();
            settings[sheet_setting.master].slaves.push([sheet_name, head_desc_row[0] ?? '', sheet_setting]);
        }

        settings[sheet_name] = sheet_setting;
    }

    return settings;
}


/**
 * 解析一个表(sheet)
 *
 * @param sheet 表的原始数据
 * @param setting 表的设置
 * @return Array or Object
 */
function parseSheet(sheet, setting, flag) {
    let result = [];

    console.log((flag ? 'Client' : 'Server') + '   * sheet:' + sheet.name + (setting.desc.length > 0 ? (' (' + setting.desc + ')') : ''), 'rows:', sheet.data.length);

    if (setting.type === SheetType.MASTER) {
        result = {};
    }

    for (let i_row = headIndex; i_row < sheet.data.length; i_row++) {

        let row = sheet.data[i_row];

        let parsed_row = parseRow(row, i_row, setting.head, flag);

        if (parsed_row == null) continue;

        if (setting.type === SheetType.MASTER) {
            let id_cell = _.find(setting.head, item => {
                return item.type === DataType.ID || item.type === DataType.IDS || item.type === DataType.IntID || item.type === DataType.IntIDS;
            });

            if (!id_cell) {
                throw `在表${sheet.name}中获取不到id列`;
            }

            if (parsed_row[id_cell.name] == undefined) {
                console.warn(`在表${sheet.name}中获取不到id列对应值, 已忽略表中行:`, i_row + 1);
                continue;
            }

            result[parsed_row[id_cell.name]] = parsed_row;

        } else {
            result.push(parsed_row);
        }
    }

    return result;
}

/**
 * 解析一行
 * @param {*} row 
 * @param {*} rowIndex 
 * @param {*} head 
 */
function parseRow(row, rowIndex, head, flag) {
    let result = {};
    let id;

    let removeRowIndex = -1;

    for (let index = 0; index < head.length; index++) {
        let cell = row[index];

        let name = head[index].name;
        let type = head[index].type;

        if (removeRowIndex == rowIndex) {
            continue;
        }
        removeRowIndex = -1;
        // 首列以`~`开头的一行则不导出此行。
        if (index == 0 && null != cell && cell.toString().startsWith(config.xlsx.ignore_prefix_symbol)) {
            removeRowIndex = rowIndex;
            continue;
        }

        // ~开头的列不输出
        if (name.startsWith(config.xlsx.ignore_prefix_symbol)) {
            continue;
        }

        // 标记为假 且列名以 __ 开头则导出dest2 且不导出dest1
        // if (!flag && name.startsWith('__')) {
        //   continue;
        // }
        // 标记为真 且列名以 _ 开头则导出dest1 不导出dest2 
        if (flag && name.startsWith(config.xlsx.only_export_server_prefix) && type !== DataType.ID && type !== DataType.IDS) {
            continue;
        }

        // if(name.startsWith('__')) name = name.replace('__', '');
        if (name.startsWith(config.xlsx.only_export_server_prefix)) name = name.replace(config.xlsx.only_export_server_prefix, '');

        if (null == cell) {
            if (type == DataType.ID || type == DataType.IntID || type == DataType.IDS || type == DataType.IntIDS) {
                continue;
            }
            switch (type) {
                case DataType.DATE:
                    result[name] = utility.numdate(0);
                    break;
                case DataType.STRING:
                    result[name] = '';
                    break;
                case DataType.NUMBER:
                case DataType.INT32:
                case DataType.INT64:
                case DataType.FLOAT:
                    result[name] = 0;
                    break;
                case DataType.BOOL:
                    result[name] = false;
                    break;
                case DataType.OBJECT:
                    result[name] = {};
                    break;
                case DataType.ARRAY:
                case DataType.BOOL_ARRAY:
                case DataType.STRING_ARRAY:
                case DataType.INT32_ARRAY:
                case DataType.INT64_ARRAY:
                case DataType.FLOAT_ARRAY:
                    result[name] = [];
                    break;
                default:
                    // result[name] = null; 此处不需要赋值null，否则会输出到json文件里
                    break;
            }
            continue;
        }

        switch (type) {
            case DataType.ID:
                id = cell + '';
                result[name] = id;
                break;
            case DataType.IntID:
                id = parseInt(cell);
                result[name] = id;
                break;
            case DataType.IDS:
                id = cell + '';
                result[name] = id;
                break;
            case DataType.IntIDS:
                id = parseInt(cell);
                result[name] = id;
                break;
            case DataType.UNKNOWN: // number string boolean
                if (utility.isNumber(cell)) {
                    result[name] = Number(cell);
                } else if (utility.isBoolean(cell)) {
                    result[name] = utility.toBoolean(cell);
                } else {
                    result[name] = cell;
                }
                break;
            case DataType.DATE:
                if (utility.isNumber(cell)) {
                    //xlsx's bug!!!
                    result[name] = utility.numdate(cell);
                } else {
                    result[name] = cell.toString();
                }
                break;
            case DataType.STRING:
                if (cell.toString().startsWith('"')) {
                    result[name] = utility.parseJsonObject(cell);
                } else {
                    result[name] = cell.toString();
                }
                break;
            case DataType.NUMBER:
            case DataType.INT32:
            case DataType.INT64:
            case DataType.FLOAT:
                //+xxx.toString() '+' means convert it to number
                if (utility.isNumber(cell)) {
                    result[name] = Number(cell);
                } else {
                    console.warn("type error at [" + rowIndex + "," + index + "]," + cell + " is not a number");
                }
                break;
            case DataType.BOOL:
                result[name] = utility.toBoolean(cell);
                break;
            case DataType.OBJECT:
                let str1 = cell.toString();
                let arr1 = str1.split(',');
                let isString1 = false;
                for (let i = 0; i < arr1.length; i++) {
                    let arr2 = arr1[i].split(':');
                    if (!arr2[0].startsWith('"') && !arr2[0].endsWith('"')) {
                        arr2[0] = `"${arr2[0]}"`;
                        arr1[i] = arr2.join(':');
                        isString1 = true;
                    }
                }
                if (isString1) {
                    cell = arr1.join(',');
                }
                if (!cell.toString().startsWith('{') && !cell.toString().endsWith('}')) {
                    cell = `{${cell}}`;
                }
                result[name] = utility.parseJsonObject(cell);
                break;
            case DataType.ARRAY:
            case DataType.INT32_ARRAY:
            case DataType.INT64_ARRAY:
            case DataType.FLOAT_ARRAY:
            case DataType.BOOL_ARRAY:
                if (!cell.toString().startsWith('[') && !cell.toString().endsWith(']')) {
                    cell = `[${cell}]`;
                }
                result[name] = utility.parseJsonObject(cell);
                break;
            case DataType.STRING_ARRAY:
                // 以逗号分隔循环检测每个节点如果没有双引号，就加上双引号
                let str = cell.toString();
                let arr = str.split(',');
                let isString = false;
                for (let i = 0; i < arr.length; i++) {
                    if (!arr[i].startsWith('"') && !arr[i].endsWith('"')) {
                        arr[i] = `"${arr[i]}"`;
                        isString = true;
                    }
                }
                if (isString) {
                    cell = arr.join(',');
                }
                if (!cell.toString().startsWith('[') && !cell.toString().endsWith(']')) {
                    cell = `[${cell}]`;
                }
                result[name] = utility.parseJsonObject(cell);
                break;
            default:
                console.error('无法识别的类型:', '[' + rowIndex + ',' + index + ']', cell, typeof (cell));
                break;
        }
    }

    if (Object.keys(result).length == 0) {
        return null;
    }

    return result;
}

module.exports = {

    parseSettings: parseSettings,

    parseWorkbook: function (workbook, settings, flag) {

        // console.log('settings >>>>>', JSON.stringify(settings, null, 2));

        let parsed_workbook = {};

        workbook.forEach(sheet => {
            // 正则移除sheet名中的()和括号中内容，以及空格
            sheet.name = sheet.name.replace(/(\(.*\))|(\s*)/g, '');

            if (sheet.name.startsWith(config.xlsx.ignore_prefix_symbol)) {
                return;
            }

            // 标记为假 且列名以 _ 开头则导出dest2 并且 dest1不会导出
            if (flag && sheet.name.startsWith(config.xlsx.only_export_server_prefix)) {
                return;
            }

            if (sheet.name.startsWith(config.xlsx.only_export_server_prefix)) sheet.name = sheet.name.replace(config.xlsx.only_export_server_prefix, '');

            let sheet_name = sheet.name;

            let isSlave = sheet_name.indexOf('@') >= 0;

            if (isSlave) {
                sheet_name = sheet_name.split('@')[0].trim();
            }

            let sheet_setting = settings[sheet_name];

            if (sheet_setting == undefined) return;

            let parsed_sheet = parseSheet(sheet, sheet_setting, flag);

            parsed_workbook[sheet_name] = parsed_sheet;

        });

        for (let name in settings) {
            if (settings[name].type === SheetType.MASTER) {

                let master_sheet = parsed_workbook[name];

                settings[name].slaves.forEach(slave_info => {
                    let slave_name = slave_info[0];
                    let slave_setting = settings[slave_name];
                    let slave_sheet = parsed_workbook[slave_name];

                    if (slave_sheet == undefined) return;

                    let key_cell = _.find(slave_setting.head, item => {
                        return item.type === DataType.ID || item.type === DataType.IDS || item.type === DataType.IntID || item.type === DataType.IntIDS;
                    });

                    //slave 表中所有数据
                    slave_sheet.forEach(row => {
                        let id = row[key_cell.name];
                        delete row[key_cell.name];
                        if (key_cell.type === DataType.IDS || key_cell.type === DataType.IntIDS) {//array
                            master_sheet[id][slave_name] = master_sheet[id][slave_name] || [];
                            master_sheet[id][slave_name].push(row);
                        } else {//hash
                            master_sheet[id][slave_name] = row;
                        }
                    });

                    delete parsed_workbook[slave_name];
                });
            }
        }

        return parsed_workbook;
    }
};