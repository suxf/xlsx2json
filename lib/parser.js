const config = require('../config.json');
const types = require('./types');
var _ = require('lodash');
const utility = require('./utility');

const DataType = types.DataType;
const SheetType = types.SheetType;

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
        //叹号开头的sheet不输出
        if (sheet.name.startsWith('~')) {
            continue;
        }

        // 标记为真 且列名以 _ 开头则导出dest1 不导出dest2 
        if (flag && sheet.name.startsWith('_')) {
            continue;
        }
        if (sheet.name.startsWith('_')) sheet.name = sheet.name.replace('_', '');

        let slave = sheet.name.indexOf('@') >= 0;
        let sheet_name = sheet.name;

        let sheet_setting = {
            type: SheetType.NORMAL,
            master: null,
            slaves: [],
            head: []
        };

        let head_desc_row = sheet.data[0];
        let head_row = sheet.data[config.xlsx.head - 1];

        if (head_row == undefined) continue;

        //parsing head setting
        for (let i = 0; i < head_row.length; ++i) {
            let cell = head_row[i];
            if (cell == null || cell == '') {
                cell = '~';
            }
            let cell_desc = head_desc_row[i];

            let head_setting = {
                name: cell,
                type: DataType.UNKNOWN,
                desc: cell_desc,
            };

            if (cell.indexOf('#') !== -1) {
                let pair = cell.split('#');
                let name = pair[0].trim();
                let type = pair[1].trim();

                head_setting.name = name;

                if (!cell.startsWith('~'))
                    head_setting.type = type;

                if (!slave && (type === DataType.ID || type === DataType.IntIDS)) {
                    sheet_setting.type = SheetType.MASTER;
                    if (type === DataType.ID) sheet_setting.id_type = 'string';
                    else if (type === DataType.IntIDS) sheet_setting.id_type = 'int';
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

    let headIndex = config.xlsx.head;
    let result = [];

    console.log((flag ? 'Client' : 'Server') + '   * sheet:', sheet.name);

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
        if (index == 0 && null != cell && cell.toString().startsWith('~')) {
            removeRowIndex = rowIndex;
            continue;
        }

        // ~开头的列不输出
        if (name.startsWith('~')) {
            continue;
        }

        // 标记为假 且列名以 __ 开头则导出dest2 且不导出dest1
        // if (!flag && name.startsWith('__')) {
        //   continue;
        // }
        // 标记为真 且列名以 _ 开头则导出dest1 不导出dest2 
        if (flag && name.startsWith('_') && type !== DataType.ID && type !== DataType.IDS) {
            continue;
        }

        // if(name.startsWith('__')) name = name.replace('__', '');
        if (name.startsWith('_')) name = name.replace('_', '');

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
                    result[name] = new Object();
                    break;
                case DataType.ARRAY:
                case DataType.BOOL_ARRAY:
                case DataType.STRING_ARRAY:
                    result[name] = new Array();
                    break;
                case DataType.INT32_ARRAY:
                    result[name] = new Int32Array();
                    break;
                case DataType.INT64_ARRAY:
                    result[name] = new BigInt64Array();
                    break;
                case DataType.FLOAT_ARRAY:
                    result[name] = new Float32Array();
                    break;
                default:
                    result[name] = null;
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
            case DataType.STRING_ARRAY:
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

            if (sheet.name.startsWith('~')) {
                return;
            }

            // 标记为假 且列名以 _ 开头则导出dest2 并且 dest1不会导出
            if (flag && sheet.name.startsWith('_')) {
                return;
            }

            if (sheet.name.startsWith('_')) sheet.name = sheet.name.replace('_', '');

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

                    if (slave_sheet == undefined || slave_sheet == undefined) return;

                    let key_cell = _.find(slave_setting.head, item => {
                        return item.type === DataType.ID || item.type === DataType.IDS || item.type === DataType.IntID || item.type === DataType.IntIDS;
                    });

                    //slave 表中所有数据
                    slave_sheet.forEach(row => {
                        let id = row[key_cell.name];
                        delete row[key_cell.name];
                        if (key_cell.type === DataType.IDS) {//array
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