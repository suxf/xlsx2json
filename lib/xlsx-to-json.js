const xlsx = require('node-xlsx');
const fs = require('fs');
const path = require('path');
var _ = require('lodash');
const config = require('../config.json');
const types = require('./types');
const parser = require('./parser');
const xlsx_csharp = require('./xlsx-to-csharp.js');

const DataType = types.DataType;

/**
 * save workbook
 */
function serializeWorkbook(parsedWorkbook, dest, flag, uglify) {

    for (let name in parsedWorkbook) {
        let sheet = parsedWorkbook[name];

        let dest_file = path.resolve(dest, (name + config.json.extension).toLowerCase());
        let resultJson = JSON.stringify(sheet, null, uglify ? 0 : 2); //, null, 2

        fs.writeFile(dest_file, resultJson, err => {
            if (err) {
                console.error("error：", err);
                throw err;
            }
            console.log((flag ? 'Client' : 'Server') + ' exported json   -->  ', path.basename(dest_file));
        });

    }

}


/**
 * save dts
 */
function serializeDTS(dest, fileName, settings, flag) {

    let dts = "";

    for (let name in settings) {
        dts += formatDTS(name, settings[name]);
    }

    let dest_file = path.resolve(dest, fileName + ".d.ts");
    fs.writeFile(dest_file, dts, err => {
        if (err) {
            console.error("error：", err);
            throw err;
        }
        console.log((flag ? 'Client' : 'Server') + ' exported t.ds   -->  ', path.basename(dest_file));
    });

}


/**
 * 
 * @param {String} name the excel file name will be use on create d.ts
 * @param {Object} head the excel head will be the javescript field
 */
function formatDTS(name, setting) {
    let className = _.capitalize(name);
    let strHead = "interface " + className + " {\r\n";
    for (let i = 0; i < setting.head.length; ++i) {
        let head = setting.head[i];
        if (head.name.startsWith('~')) {
            continue;
        }
        let typesDes = "any";
        switch (head.type) {
            case DataType.NUMBER:
            case DataType.INT32:
            case DataType.INT64:
            case DataType.FLOAT:
                {
                    typesDes = "number";
                    break;
                }
            case DataType.STRING:
                {
                    typesDes = "string";
                    break;
                }
            case DataType.BOOL:
                {
                    typesDes = "boolean";
                    break;
                }
            case DataType.ID:
            case DataType.IntID:
                {
                    typesDes = "string";
                    break;
                }
            case DataType.ARRAY:
                {
                    typesDes = "any[]";
                    break;
                }
            case DataType.INT32_ARRAY:
            case DataType.INT64_ARRAY:
            case DataType.FLOAT_ARRAY:
                {
                    typesDes = "number[]";
                    break;
                }
            case DataType.STRING_ARRAY:
                {
                    typesDes = "string[]";
                    break;
                }
            case DataType.BOOL_ARRAY:
                {
                    typesDes = "boolean[]";
                    break;
                }
            case DataType.OBJECT:
                {
                    typesDes = "any";
                    break;
                }
            case DataType.UNKNOWN:
                {
                    typesDes = "any";
                    break;
                }
            default:
                {
                    typesDes = "any";
                }
        }
        strHead += "\t" + head.name + ": " + typesDes + "\r\n";
    }

    setting.slaves.forEach(slave_info => {
        let slave_name = slave_info[0];
        strHead += "\t" + slave_name + ": " + _.capitalize(slave_name) + "\r\n"
    });

    strHead += "}\r\n";
    return strHead;
}

module.exports = {

    /**
     * convert xlsx file to json and save it to file system.
     * @param  {String} src path of .xlsx files.
     * @param  {String} dest       directory for exported json files.
     * @param  {Number} headIndex      index of head line.
     * @param  {String} separator      array separator.
     *
     * excel structure
     * workbook > worksheet > table(row column)
     */
    toJson: function (src, json_dest, csharp_dest, flag, uglify) {
        if (!fs.existsSync(json_dest)) {
            fs.mkdirSync(json_dest);
        }

        let parsed_src = path.parse(src);

        if (parsed_src.base.startsWith("~")) {
            return;
        }

        let workbook = xlsx.parse(src);

        console.log((flag ? 'Client' : 'Server') + " parsing excel:", parsed_src.base);

        let settings = parser.parseSettings(workbook, flag);

        // let parsed_workbook = parseWorkbook(workbook, json_dest, headIndex, path.join(json_dest, parsed_src.name));
        let parsed_workbook = parser.parseWorkbook(workbook, settings, flag);

        serializeWorkbook(parsed_workbook, json_dest, flag, uglify);

        if (config.ts) {
            serializeDTS(json_dest, parsed_src.name, settings, flag);
        }

        if (config.cs) {
            xlsx_csharp.toCs(csharp_dest, settings, parsed_workbook, flag);
        }
    }
};