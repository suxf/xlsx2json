const fs = require('fs');
const path = require('path');
var _ = require('lodash');
const types = require('./types');
const config = require('../config.json');
const utility = require('./utility');

const DataType = types.DataType;

var strConfMgr = { true: ['', '', '', '', ''], false: ['', '', '', '', ''] };
var configCount = { true: 0, false: 0 };

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

        if (setting.desc != null && setting.desc.length > 0) {
            let tmp = setting.desc.replace('\r', '')
            let descArry = tmp.split('\n');
            strConfMgr[flag][0] += "\t/// <summary>\n";
            for (let i = 0; i < descArry.length; i++) {
                if (i == 0) {
                    strConfMgr[flag][0] += "\t/// " + descArry[i] + '\n';
                } else {
                    if (descArry[i] == '') continue;
                    strConfMgr[flag][0] += "\t/// <para>" + descArry[i] + '</para>\n';
                }
            }
            strConfMgr[flag][0] += "\t/// </summary>\n";
        }

        if (setting.type == types.SheetType.MASTER) {
            strConfMgr[flag][0] += `\tpublic static Dictionary<${setting.id_type}, ${name}${config.csharp.row_suffix}> ${name}${config.csharp.collection_suffix};\n`;
            strConfMgr[flag][0] += `\tprivate static Dictionary<${setting.id_type}, ${name}${config.csharp.row_suffix}> _p${name}${config.csharp.collection_suffix};\n\n`;

            strConfMgr[flag][1] += `\t\t_p${name}${config.csharp.collection_suffix} = JsonConvert.DeserializeObject<Dictionary<${setting.id_type}, ${name}${config.csharp.row_suffix}>>(loadJsonFile("${(name + (config.csharp.has_extension ? config.json.extension : '')).toLowerCase()}"));\n`;
            strConfMgr[flag][1] += `\t\t_loadedData.Add("${(name + (config.csharp.has_extension ? config.json.extension : '')).toLowerCase()}");\n`;

            strConfMgr[flag][2] += `\t\tloadJsonFile("${(name + (config.csharp.has_extension ? config.json.extension : '')).toLowerCase()}", json => {\n`;
            strConfMgr[flag][2] += `\t\t\t_p${name}${config.csharp.collection_suffix} = JsonConvert.DeserializeObject<Dictionary<${setting.id_type}, ${name}${config.csharp.row_suffix}>>(json);\n`;
            strConfMgr[flag][2] += `\t\t\t_loadedData.Add("${(name + (config.csharp.has_extension ? config.json.extension : '')).toLowerCase()}");\n`;
            strConfMgr[flag][2] += '\t\t\tExchangeAllLoad();\n';
            strConfMgr[flag][2] += `\t\t\tonLoadCallback("${(name + (config.csharp.has_extension ? config.json.extension : '')).toLowerCase()}");\n`;
            strConfMgr[flag][2] += `\t\t});\n`;

            // strConfMgr[flag][3] += `\t\t${name}${config.csharp.collection_suffix} = _p${name}${config.csharp.collection_suffix};\n`;
            strConfMgr[flag][4] += `\t\tInterlocked.Exchange(ref ${name}${config.csharp.collection_suffix}, _p${name}${config.csharp.collection_suffix});\n`;

            configCount[flag]++;
        }
        else if (setting.type == types.SheetType.NORMAL) {
            strConfMgr[flag][0] += `\tpublic static ${name}${config.csharp.row_suffix}[] ${name}${config.csharp.collection_suffix};\n`;
            strConfMgr[flag][0] += `\tprivate static ${name}${config.csharp.row_suffix}[] _p${name}${config.csharp.collection_suffix};\n\n`;

            strConfMgr[flag][1] += `\t\t_p${name}${config.csharp.collection_suffix} = JsonConvert.DeserializeObject<${name}${config.csharp.row_suffix}[]>(loadJsonFile("${(name + (config.csharp.has_extension ? config.json.extension : '')).toLowerCase()}"));\n`;

            strConfMgr[flag][2] += `\t\tloadJsonFile("${(name + (config.csharp.has_extension ? config.json.extension : '')).toLowerCase()}", json => {\n`;
            strConfMgr[flag][2] += `\t\t\t_p${name}${config.csharp.collection_suffix} = JsonConvert.DeserializeObject<${name}${config.csharp.row_suffix}[]>(json);\n`;

            // strConfMgr[flag][3] += `\t\t${name}${config.csharp.collection_suffix} = _p${name}${config.csharp.collection_suffix};\n`;
            strConfMgr[flag][4] += `\t\tInterlocked.Exchange(ref ${name}${config.csharp.collection_suffix}, _p${name}${config.csharp.collection_suffix});\n`;

            if (setting.desc != null && setting.desc.length > 0) {
                let tmp = setting.desc.replace('\r', '')
                // 分割\n成数组并去除空的字符串
                let descArry = tmp.split('\n');
                strConfMgr[flag][0] += "\t/// <summary>\n";
                for (let i = 0; i < descArry.length; i++) {
                    if (i == 0) {
                        strConfMgr[flag][0] += "\t/// " + descArry[i] + '(首行数据)\n';
                    } else {
                        if (descArry[i] == '') continue;
                        strConfMgr[flag][0] += "\t/// <para>" + descArry[i] + '</para>\n';
                    }
                }
                strConfMgr[flag][0] += "\t/// </summary>\n";
            }
            strConfMgr[flag][0] += `\tpublic static ${name}${config.csharp.row_suffix} ${name}${config.csharp.row_suffix};\n`;
            strConfMgr[flag][0] += `\tprivate static ${name}${config.csharp.row_suffix} _p${name}${config.csharp.row_suffix};\n\n`;

            strConfMgr[flag][1] += `\t\t_p${name}${config.csharp.row_suffix} = _p${name}${config.csharp.collection_suffix}[0];\n`;
            strConfMgr[flag][1] += `\t\t_loadedData.Add("${(name + (config.csharp.has_extension ? config.json.extension : '')).toLowerCase()}");\n`;

            strConfMgr[flag][2] += `\t\t\t_p${name}${config.csharp.row_suffix} = _p${name}${config.csharp.collection_suffix}[0];\n`;
            strConfMgr[flag][2] += `\t\t\t_loadedData.Add("${(name + (config.csharp.has_extension ? config.json.extension : '')).toLowerCase()}");\n`;
            strConfMgr[flag][2] += '\t\t\tExchangeAllLoad();\n';
            strConfMgr[flag][2] += `\t\t\tonLoadCallback("${(name + (config.csharp.has_extension ? config.json.extension : '')).toLowerCase()}");\n`;
            strConfMgr[flag][2] += `\t\t});\n`;

            // strConfMgr[flag][3] += `\t\t${name}${config.csharp.row_suffix} = _p${name}${config.csharp.row_suffix};\n`;
            strConfMgr[flag][4] += `\t\tInterlocked.Exchange(ref ${name}${config.csharp.row_suffix}, _p${name}${config.csharp.row_suffix});\n`;

            configCount[flag]++;
        }

        let dest_file = path.resolve(dest, name + config.csharp.row_suffix + ".cs");
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
    if (config.csharp.namespace != undefined && config.csharp.namespace != '') {
        indent = '\t';
        strHead += `namespace ${config.csharp.namespace} {\n\n`;
    }

    if (setting.desc != null && setting.desc.length > 0) {
        let tmp = setting.desc.replace('\r', '')
        // 分割\n成数组并去除空的字符串
        let descArry = tmp.split('\n');
        strHead += indent + "/// <summary>\n";
        for (let i = 0; i < descArry.length; i++) {
            if (i == 0) {
                strHead += indent + "/// " + descArry[i] + '\n';
            } else {
                if (descArry[i] == '') continue;
                strHead += indent + "/// <para>" + descArry[i] + '</para>\n';
            }
        }
        strHead += indent + "/// </summary>\n";
    }
    strHead += indent + "[Serializable]\n";

    if (setting.type == types.SheetType.NORMAL) {
        strHead += indent + "public class " + name + config.csharp.row_suffix + "\n";
    }
    else if (setting.type == types.SheetType.MASTER) {
        strHead += indent + "public class " + name + config.csharp.row_suffix + "\n";
    }
    strHead += indent + "{\n";

    for (let i = 0; i < setting.head.length; ++i) {
        let head = setting.head[i];
        if (head.name.startsWith(config.xlsx.ignore_prefix_symbol)) {
            continue;
        }

        let typesDes = detectType(head, sheetRows);

        if (head.desc != null && head.desc.length > 0) {
            let tmp = head.desc.replace('\r', '')
            // 分割\n成数组并去除空的字符串
            let descArry = tmp.split('\n');
            strHead += indent + "\t/// <summary>\n";
            for (let i = 0; i < descArry.length; i++) {
                if (i == 0) {
                    strHead += indent + "\t/// " + descArry[i] + '\n';
                } else {
                    if (descArry[i] == '') continue;
                    strHead += indent + "\t/// <para>" + descArry[i] + '</para>\n';
                }
            }
            strHead += indent + "\t/// </summary>\n";
        }
        strHead += indent + "\tpublic " + typesDes + " " + head.name + ";\n\n";
    }

    let strSlaveHead = '';

    setting.slaves.forEach(slave_info => {
        let slave_name = slave_info[0];
        strHead += indent + "\t/// <summary>\n";
        strHead += indent + "\t/// " + slave_info[1] + '\n';
        strHead += indent + "\t/// </summary>\n";
        let key_cell = _.find(slave_info[2].head, item => {
            return item.type === DataType.IDS || item.type === DataType.IntIDS;
        });
        strHead += indent + "\tpublic " + slave_name + (key_cell != null ? "[]" : "") + " " + slave_name + ";\n\n";

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
            if (head.name.startsWith(config.xlsx.ignore_prefix_symbol)) {
                continue;
            }

            let typesDes = detectType(head, sheetRows, slave_name);

            if (head.desc != null && head.desc.length > 0) {
                let tmp = head.desc.replace('\r', '')
                // 分割\n成数组并去除空的字符串
                let descArry = tmp.split('\n');
                strSlaveHead += indent + "\t/// <summary>\n";
                for (let i = 0; i < descArry.length; i++) {
                    if (i == 0) {
                        strSlaveHead += indent + "\t/// " + descArry[i] + '\n';
                    } else {
                        if (descArry[i] == '') continue;
                        strSlaveHead += indent + "\t/// <para>" + descArry[i] + '</para>\n';
                    }
                }
                strSlaveHead += indent + "\t/// </summary>\n";
            }
            strSlaveHead += indent + "\tpublic " + typesDes + " " + head.name + ";\n\n";
        }

        strSlaveHead += indent + "}\n";
    });

    strHead += indent + "}\n";
    strHead += strSlaveHead;

    if (config.csharp.namespace != undefined && config.csharp.namespace != '') {
        strHead += "}\n";
    }

    return strHead;
}

function detectType(head, sheetRows, slave_name) {
    var head_type = head.detect ? DataType.UNKNOWN : head.type;
    switch (head_type) {
        case DataType.NUMBER:
        case DataType.INT32:
        case DataType.IntIDS:
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
        case DataType.IDS:
            {
                return "string";
            }
        case DataType.IntID:
            {
                return "int";
            }
        case DataType.ARRAY:
            {
                let typeStr = "";
                for (let row of sheetRows) {
                    let typesValue = undefined;
                    if (slave_name && row[slave_name]) {
                        // 判断是否为数组
                        if (row[slave_name] instanceof Array) {
                            for (let i = 0; i < row[slave_name].length; i++) {
                                if (row[slave_name][i][head.name] != undefined && row[slave_name][i][head.name] != '') {
                                    typesValue = row[slave_name][i][head.name];
                                    try {
                                        if (!typesValue.toString().startsWith('[') && !typesValue.toString().endsWith(']')) {
                                            typesValue = `[${typesValue}]`;
                                        }
                                        typesValue = utility.parseJsonObject(typesValue);
                                        // 判断typesValue数组类型
                                        if (typesValue.length == 0) continue;
                                        let typeStrTmp = utility.detectCSharpType(typesValue[0]);
                                        typeStr = convertType(typeStrTmp, typeStr);
                                        if (typeStr === "string") break;
                                    } catch (error) { }
                                }
                            }
                        } else {
                            typesValue = row[slave_name][head.name];
                        }
                    }
                    else {
                        typesValue = row[head.name];
                    }
                    if (typesValue === undefined || typesValue === null || typesValue === '') continue;
                    try {
                        if (!typesValue.toString().startsWith('[') && !typesValue.toString().endsWith(']')) {
                            typesValue = `[${typesValue}]`;
                        }
                        typesValue = utility.parseJsonObject(typesValue);
                        // 判断typesValue数组类型
                        if (typesValue.length == 0) continue;
                        let typeStrTmp = utility.detectCSharpType(typesValue[0]);
                        typeStr = convertType(typeStrTmp, typeStr);
                        if (typeStr === "string") break;
                    } catch (error) { }
                }
                return typeStr != "" ? `${typeStr}[]` : "string[]";
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
                let typeKeyStr = "";
                let typeValueStr = "";
                for (let row of sheetRows) {
                    let typesValue = undefined;
                    if (slave_name && row[slave_name]) {
                        // 判断是否为数组
                        if (row[slave_name] instanceof Array) {
                            for (let i = 0; i < row[slave_name].length; i++) {
                                if (row[slave_name][i][head.name] != undefined && row[slave_name][i][head.name] != '') {
                                    typesValue = row[slave_name][i][head.name];
                                    // 判断typesValue数组类型
                                    var keys = Object.keys(typesValue);
                                    if (keys.length == 0) continue;
                                    var values = Object.values(typesValue);
                                    for (let key of keys) {
                                        let typeStrTmp = utility.detectCSharpType(key);
                                        typeKeyStr = convertType(typeStrTmp, typeKeyStr);
                                        if (typeKeyStr === "string") break;
                                    }
                                    for (let value of values) {
                                        let typeStrTmp = utility.detectCSharpType(value);
                                        typeValueStr = convertType(typeStrTmp, typeValueStr);
                                        if (typeValueStr === "string") break;
                                    }
                                    if (typeKeyStr === "string" && typeValueStr === "string") break;
                                }
                            }
                        } else {
                            typesValue = row[slave_name][head.name];
                        }
                    }
                    else {
                        typesValue = row[head.name];
                    }
                    if (typesValue === undefined || typesValue === null || typesValue === '') continue;
                    // 判断typesValue数组类型
                    var keys = Object.keys(typesValue);
                    if (keys.length == 0) continue;
                    var values = Object.values(typesValue);
                    for (let key of keys) {
                        let typeStrTmp = utility.detectCSharpType(key);
                        typeKeyStr = convertType(typeStrTmp, typeKeyStr);
                        if (typeKeyStr === "string") break;
                    }
                    for (let value of values) {
                        let typeStrTmp = utility.detectCSharpType(value);
                        typeValueStr = convertType(typeStrTmp, typeValueStr);
                        if (typeValueStr === "string") break;
                    }
                    if (typeKeyStr === "string" && typeValueStr === "string") break;
                }
                return typeKeyStr != "" ? `Dictionary<${typeKeyStr}, ${typeValueStr}>` : "Dictionary<object, object>";
            }
        case DataType.UNKNOWN:
        default:
            {
                let typeStr = "";
                for (let row of sheetRows) {
                    let typesValue = undefined;
                    if (slave_name && row[slave_name]) {
                        // 判断是否为数组
                        if (row[slave_name] instanceof Array) {
                            for (let i = 0; i < row[slave_name].length; i++) {
                                if (row[slave_name][i][head.name] != undefined && row[slave_name][i][head.name] != '') {
                                    typesValue = row[slave_name][i][head.name];
                                    try {
                                        let tmp = utility.parseJsonObject(typesValue);
                                        if (typeof tmp !== 'array') {
                                            // 判断typesValue数组类型
                                            if (tmp.length > 0) {
                                                for (let i = 0; i < tmp.length; i++) {
                                                    let typeStrTmp = utility.detectCSharpType(tmp[i]);
                                                    typeStr = convertType(typeStrTmp, typeStr);
                                                    if (typeStr === "string") break;
                                                }
                                                return `${typeStr}[]`;
                                            } else {
                                                // 如果是空数组，直接返回string[]
                                                if (tmp.length === 0) {
                                                    return "string[]";
                                                }
                                            }
                                        }
                                    } catch (error) { }

                                    // 判断typesValue数组类型
                                    try {
                                        let tmp = utility.parseJsonObject(typesValue);
                                        if (typeof tmp === 'object') {
                                            var keys = Object.keys(tmp);
                                            if (keys.length > 0) {
                                                var values = Object.values(tmp);
                                                for (let key of keys) {
                                                    let typeStrTmp = utility.detectCSharpType(key);
                                                    typeStr = convertType(typeStrTmp, typeStr);
                                                    if (typeStr === "string") break;
                                                }
                                                let typeValueStr = "";
                                                for (let value of values) {
                                                    let typeStrTmp = utility.detectCSharpType(value);
                                                    typeValueStr = convertType(typeStrTmp, typeValueStr);
                                                    if (typeValueStr === "string") break;
                                                }
                                                return typeStr != "" ? `Dictionary<${typeStr}, ${typeValueStr}>` : "Dictionary<object, object>";
                                            } else {
                                                return "Dictionary<object, object>";
                                            }
                                        }
                                    } catch (error) { }
                                }
                            }
                        } else {
                            typesValue = row[slave_name][head.name];
                        }
                    }
                    else {
                        typesValue = row[head.name];
                    }
                    if (typesValue === undefined || typesValue === null || typesValue === '') continue;
                    try {
                        let tmp = utility.parseJsonObject(typesValue);
                        if (typeof tmp === 'array') {
                            // 判断typesValue数组类型
                            if (tmp.length > 0) {
                                for (let i = 0; i < tmp.length; i++) {
                                    let typeStrTmp = utility.detectCSharpType(tmp[i]);
                                    typeStr = convertType(typeStrTmp, typeStr);
                                    if (typeStr === "string") break;
                                }
                                return `${typeStr}[]`;
                            } else {
                                // 如果是空数组，直接返回string[]
                                if (tmp.length === 0) {
                                    return "string[]";
                                }
                            }
                        }
                    } catch (error) { }

                    // 判断typesValue数组类型
                    try {
                        let tmp = utility.parseJsonObject(typesValue);
                        if (typeof tmp === 'object') {
                            var keys = Object.keys(tmp);
                            if (keys.length > 0) {
                                var values = Object.values(tmp);
                                for (let key of keys) {
                                    let typeStrTmp = utility.detectCSharpType(key);
                                    typeStr = convertType(typeStrTmp, typeStr);
                                    if (typeStr === "string") break;
                                }
                                let typeValueStr = "";
                                for (let value of values) {
                                    let typeStrTmp = utility.detectCSharpType(value);
                                    typeValueStr = convertType(typeStrTmp, typeValueStr);
                                    if (typeValueStr === "string") break;
                                }
                                return typeStr != "" ? `Dictionary<${typeStr}, ${typeValueStr}>` : "Dictionary<object, object>";
                            } else {
                                return "Dictionary<object, object>";
                            }
                        }
                    } catch (error) { }
                    let typeStrTmp = utility.detectCSharpType(typesValue);
                    typeStr = convertType(typeStrTmp, typeStr);
                    if (typeStr === "string") break;
                }

                return typeStr != "" ? typeStr : "string";
            }
    }
}

function convertType(newType, oldType) {
    if (oldType === "" || oldType === undefined || oldType === null) {
        return newType;
    }
    else if (oldType === "bool") {
        if (newType !== "bool") {
            return newType;
        }
    }
    else if (oldType === "int") {
        if (newType === "float" || newType === "string") {
            return newType;
        }
    }
    else if (oldType === "long") {
        if (newType === "int" || newType === "float" || newType === "string") {
            return newType;
        }
    }
    else if (oldType === "float") {
        if (newType === "string") {
            return newType;
        }
    }

    return oldType;
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
        let strCs = "using Newtonsoft.Json;// 自行安装此开源库\n";
        strCs += "using System;\n";
        strCs += "using System.Collections.Generic;\n";
        strCs += "using System.Threading;\n"
        if (config.csharp.namespace != undefined && config.csharp.namespace != '') {
            strCs += `\nnamespace ${config.csharp.namespace} {\n`;
        } else {
            strCs += "\n";
        }

        strCs += "/// <summary>\n";
        strCs += "/// 配置管理器\n";
        strCs += "/// </summary>\n";
        strCs += `public static class ${config.csharp.manager_name}\n`;
        strCs += "{\n";

        strCs += strConfMgr[flag][0];

        strCs += "\t/// <summary>\n";
        strCs += "\t/// 是否已加载所有配置\n";
        strCs += "\t/// </summary>\n";
        strCs += "\tpublic static bool IsAllLoaded => _loadedData.Count == LoadTotalCount;\n\n";

        strCs += "\t/// <summary>\n";
        strCs += "\t/// 已加载配置数\n";
        strCs += "\t/// </summary>\n";
        strCs += "\tpublic static int LoadedCount => _loadedData.Count;\n\n";

        strCs += "\t/// <summary>\n";
        strCs += "\t/// 需加载配置数\n";
        strCs += "\t/// </summary>\n";
        strCs += `\tpublic const int LoadTotalCount = ${configCount[flag]};\n\n`;

        strCs += "\tprivate static readonly HashSet<string> _loadedData = new();\n\n";

        strCs += "\tprivate static Func<string, string> _loadJsonFile = null;\n";
        strCs += "\tprivate static Action<string, Action<string>> _loadJsonFileAsync = null;\n\n";

        strCs += "\t/// <summary>\n";
        strCs += "\t/// 重载配置\n";
        strCs += "\t/// <para>需第一次加载使用同步加载配置，否则无效</para>\n";
        strCs += "\t/// </summary>\n";
        strCs += "\tpublic static void Reload()\n";
        strCs += "\t{\n";
        strCs += "\t\tif (_loadJsonFile != null) Load(_loadJsonFile);\n";
        strCs += "\t}\n\n";

        strCs += "\t/// <summary>\n";
        strCs += "\t/// 异步重载配置\n";
        strCs += "\t/// <para>需第一次加载使用异步加载配置，否则无效</para>\n";
        strCs += "\t/// </summary>\n";
        strCs += "\tpublic static void ReloadAsync(Action<string> onLoadCallback)\n";
        strCs += "\t{\n";
        strCs += "\t\tif (_loadJsonFileAsync != null) LoadAsync(_loadJsonFileAsync, onLoadCallback);\n";
        strCs += "\t}\n\n";

        strCs += "\t/// <summary>\n";
        strCs += "\t/// 加载配置\n";
        strCs += "\t/// </summary>\n";
        strCs += '\t/// <param name="loadJsonFile">读取文件回调。获取JSON文件名，返回需反序列化的JSON字符</param>\n';
        strCs += "\tpublic static void Load(Func<string, string> loadJsonFile)\n";
        strCs += "\t{\n";
        strCs += "\t\t_loadJsonFile = loadJsonFile;\n\n";
        strCs += "\t\t_loadedData.Clear();\n\n";

        strCs += strConfMgr[flag][1];

        strCs += "\n";
        strCs += "\t\tExchangeAllLoad();\n";
        strCs += "\t}\n\n";

        strCs += "\t/// <summary>\n";
        strCs += "\t/// 异步加载配置\n";
        strCs += "\t/// </summary>\n";
        strCs += '\t/// <param name="loadJsonFile">异步读取文件回调。获取JSON文件名，返回需反序列化的JSON字符</param>\n';
        strCs += '\t/// <param name="onLoadCallback">每次加载完成时回调, 参数为当前加载的配置文件</param>\n';
        strCs += "\tpublic static void LoadAsync(Action<string, Action<string>> loadJsonFile, Action<string> onLoadCallback)\n";
        strCs += "\t{\n";
        strCs += "\t\t_loadJsonFileAsync = loadJsonFile;\n\n";
        strCs += "\t\t_loadedData.Clear();\n\n";
        
        strCs += strConfMgr[flag][2];

        strCs += "\t}\n\n";
        
        strCs += "\t/// <summary>\n";
        strCs += "\t/// 赋值配置变量\n";
        strCs += "\t/// </summary>\n";
        strCs += `\tprivate static void ExchangeAllLoad() {\n`;
        strCs += `\t\tif (!IsAllLoaded) return;\n`;
        strCs += strConfMgr[flag][4];
        strCs += "\t}\n";
        strCs += "}\n";
        strCs += "}\n";

        let dest_file = path.resolve(dest, config.csharp.manager_name + ".cs");
        fs.writeFile(dest_file, strCs, err => {
            if (err) {
                console.error("error：", err);
                throw err;
            }
            // console.log((flag ? 'Client' : 'Server') + ' exported csharp -->  ', path.basename(dest_file));
        });
    }
};