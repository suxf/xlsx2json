const fs = require('fs');
const path = require('path');
var _ = require('lodash');
const types = require('./types');
const config = require('../config.json');
const utility = require('./utility');

const DataType = types.DataType;

var strConfMgr = {true:['', ''], false:['', '']};

/**
 * save cs
 */
function serializeCs(dest, settings, sheetWorks, flag) {
    
    for (let name in settings) {
        let setting = settings[name];
        if (!setting || !sheetWorks[name] || !Object.values(sheetWorks[name])[0]) {
            continue;
        }
        let dts = formatCs(name, settings[name], Object.values(sheetWorks[name]));

        strConfMgr[flag][0] += "\t/// <summary>\n";
        strConfMgr[flag][0] += "\t/// " + (setting.head[0].desc ?? '') + '\n';
        strConfMgr[flag][0] += "\t/// </summary>\n";
        if (setting.type == types.SheetType.MASTER) {
            strConfMgr[flag][0] += `\tpublic static Dictionary<${setting.id_type}, ${name}Cfg> ${name}Cfgs;\n\n`;
            strConfMgr[flag][1] += `\t\t${name}Cfgs = JsonConvert.DeserializeObject<Dictionary<${setting.id_type}, ${name}Cfg>>(loadJsonFile("${(name + config.json.extension).toLowerCase()}"));\n`;
        }
        else if(setting.type == types.SheetType.NORMAL) {
            strConfMgr[flag][0] += `\tpublic static ${name}Cfg[] ${name}Cfgs;\n\n`;
            strConfMgr[flag][1] += `\t\t${name}Cfgs = JsonConvert.DeserializeObject<${name}Cfg[]>(loadJsonFile("${(name + config.json.extension).toLowerCase()}"));\n`;
        }

        let dest_file = path.resolve(dest, name + "Cfg.cs");
        fs.writeFile(dest_file, dts, err => {
            if (err) {
                console.error("error：", err);
                throw err;
            }
            console.log((flag ? 'Client' : 'Server') + ' exported csharp -->  ', path.basename(dest_file));
        });
    }
}

/**
 * 
 * @param {String} name the excel file name will be use on create d.ts
 * @param {Object} head the excel head will be the javescript field
 */
function formatCs(name, setting, sheetRows) {
    let strHead = "using System;\n";
    strHead += "using System.Collections.Generic;\n\n";

    let indent = '';
    if(config.csharp.namespace != undefined && config.csharp.namespace != '')
    {
        indent = '\t';
        strHead += `namespace ${config.csharp.namespace} {\n\n`;
    }

    strHead += indent + "/// <summary>\n";
    strHead += indent + "/// " + (setting.head[0].desc ?? '') + '\n';
    strHead += indent + "/// </summary>\n";
    strHead += indent + "[Serializable]\n";

    if (setting.type == types.SheetType.NORMAL) {
        strHead += indent + "public class " + name + "Cfg\n";
    }
    else if (setting.type == types.SheetType.MASTER) {
        strHead += indent + "public class " + name + "Cfg\n";
    }
    strHead += indent + "{\n";

    for (let i = 0; i < setting.head.length; ++i) {
        let head = setting.head[i];
        if (head.name.startsWith('~')) {
            continue;
        }

        let typesDes = detectType(head, sheetRows);

        strHead += indent + "\t/// <summary>\n";
        strHead += indent + "\t/// " + head.desc + '\n';
        strHead += indent + "\t/// </summary>\n";
        strHead += indent + "\tpublic " + typesDes + " " + head.name + ";\n\n";
    }

    let strSlaveHead = '';

    setting.slaves.forEach(slave_info => {
        let slave_name = slave_info[0];
        strHead += indent + "\t/// <summary>\n";
        strHead += indent + "\t/// " + slave_info[1] + '\n';
        strHead += indent + "\t/// </summary>\n";
        strHead += indent + "\tpublic " + slave_name + " " + slave_name + ";\n\n"

        strSlaveHead += "\n";
        strSlaveHead += indent + "/// <summary>\n";
        strSlaveHead += indent + "/// " + slave_info[1] + '\n';
        strSlaveHead += indent + "/// </summary>\n";
        strSlaveHead += indent + "[Serializable]\n";
        strSlaveHead += indent + "public class " + slave_name + " \n";
        strSlaveHead += indent + "{\n";

        let slave_head = slave_info[2].head;
        for (let i = 0; i < slave_head.length; ++i) {
            let head = slave_head[i];
            if (head.name.startsWith('~')) {
                continue;
            }
    
            let typesDes = detectType(head, sheetRows, slave_name);
    
            strSlaveHead += indent + "\t/// <summary>\n";
            strSlaveHead += indent + "\t/// " + head.desc + '\n';
            strSlaveHead += indent + "\t/// </summary>\n";
            strSlaveHead += indent + "\tpublic " + typesDes + " " + head.name + ";\n\n";
        }

        strSlaveHead += indent + "}\n";
    });

    strHead += indent + "}\n";
    strHead += strSlaveHead;

    if(config.csharp.namespace != undefined && config.csharp.namespace != '')
    {
        strHead += "}\n";
    }

    return strHead;
}

function detectType(head, sheetRows, slave_name)
{
    switch (head.type) {
        case DataType.NUMBER:
        case DataType.INT32:
            {
                return "int";
            }
        case DataType.INT64:
            {
                return "long";
            }
        case DataType.FLOAT:
            {
                return "float";
            }
        case DataType.STRING:
            {
                return "string";
            }
        case DataType.BOOL:
            {
                return "bool";
            }
        case DataType.ID:
            {
                return "string";
            }
        case DataType.IntID:
            {
                return "int";
            }
        case DataType.ARRAY:
            {
                for (let row of sheetRows) {
                    let typesValue = undefined;
                    if (slave_name && row[slave_name]) {
                        typesValue = row[slave_name][head.name];
                    }
                    else {
                        typesValue = row[head.name];
                    }
                    if (typesValue == undefined || typesValue == '') continue;
                    try {
                        if (!typesValue.toString().startsWith('[') && !typesValue.toString().endsWith(']')) {
                            typesValue = `[${typesValue}]`;
                        }
                        typesValue = utility.parseJsonObject(typesValue);
                        // 判断typesValue数组类型
                        if (typesValue.length == 0) continue;
                        return utility.detectType(typesValue[0]) + "[]";
                    } catch (error) { }
                }
                return "string[]";
            }
        case DataType.INT32_ARRAY:
            {
                return "int[]";
            }
        case DataType.INT64_ARRAY:
            {
                return "long[]";
            }
        case DataType.FLOAT_ARRAY:
            {
                return "float[]";
            }
        case DataType.STRING_ARRAY:
            {
                return "string[]";
            }
        case DataType.BOOL_ARRAY:
            {
                return "bool[]";
            }
        case DataType.OBJECT:
            {
                for (let row of sheetRows) {
                    let typesValue = undefined;
                    if (slave_name && row[slave_name]) {
                        typesValue = row[slave_name][head.name];
                    }
                    else {
                        typesValue = row[head.name];
                    }
                    if (typesValue == undefined || typesValue == '') continue;
                    // 判断typesValue数组类型
                    var keys = Object.keys(typesValue);
                    var values = Object.values(typesValue);
                    if (keys.length == 0) continue;
                    return `Dictionary<${utility.detectType(keys[0])}, ${utility.detectType(values[0])}>`;
                }
                return "Dictionary<object, object>";
            }
        case DataType.UNKNOWN:
        default:
            {
                for (let row of sheetRows) {
                    let typesValue = undefined;
                    if (slave_name && row[slave_name]) {
                        typesValue = row[slave_name][head.name];
                    }
                    else {
                        typesValue = row[head.name];
                    }
                    if (typesValue == undefined || typesValue == '') continue;
                    return utility.detectType(typesValue);
                }
            }
    }
    return "object";
}

module.exports = {
    /**
     * convert xlsx file to csharp and save it to file system.
     * @param  {String} src path of .xlsx files.
     * @param  {String} dest       directory for exported json files.
     * @param  {Number} headIndex      index of head line.
     * @param  {String} separator      array separator.
     *
     * excel structure
     * workbook > worksheet > table(row column)
     */
    toCs: function (dest, settings, sheetWorks, flag) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        serializeCs(dest, settings, sheetWorks, flag);
    },

    toCsConfMgr: function (dest, flag) {
        let strCs = "using Newtonsoft.Json;\n";
        strCs += "using System;\n";
        strCs += "using System.Collections.Generic;\n\n";

        strCs += "/// <summary>\n";
        strCs += "/// 配置管理器\n";
        strCs += "/// </summary>\n";
        strCs += "public static class ConfMgr\n";
        strCs += "{\n";

        strCs += strConfMgr[flag][0];

        strCs += "\t/// <summary>\n";
        strCs += "\t/// 加载配置\n";
        strCs += "\t/// </summary>\n";
        strCs += '\t/// <param name="loadJsonFile">读取文件回调。获取JSON文件名，返回需反序列化的JSON字符</param>\n';
        strCs += "\tpublic static void Load(Func<string, string> loadJsonFile)\n";
        strCs += "\t{\n";

        strCs += strConfMgr[flag][1];

        strCs += "\t}\n";
        strCs += "}\n";

        let dest_file = path.resolve(dest, "ConfMgr.cs");
        fs.writeFile(dest_file, strCs, err => {
            if (err) {
                console.error("error：", err);
                throw err;
            }
            // console.log((flag ? 'Client' : 'Server') + ' exported csharp -->  ', path.basename(dest_file));
        });
    }
};