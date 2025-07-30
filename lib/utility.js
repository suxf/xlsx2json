var _ = require('lodash');

//fuck node-xlsx's bug
var basedate = new Date(1899, 11, 30, 0, 0, 0); // 2209161600000
// var dnthresh = basedate.getTime() + (new Date().getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000;
var dnthresh = basedate.getTime() + (new Date().getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000;
// function datenum(v, date1904) {
// 	var epoch = v.getTime();
// 	if(date1904) epoch -= 1462*24*60*60*1000;
// 	return (epoch - dnthresh) / (24 * 60 * 60 * 1000);
// }

module.exports = {
    parseJsonObject: function (data) {
        try {
            return eval("(" + data + ")");
        }
        catch (e) {
            // 替换所有FALSE为false正则
            data = _.replace(data, /TRUE/g, "true");
            data = _.replace(data, /FALSE/g, "false");
            data = _.replace(data, /True/g, "true");
            data = _.replace(data, /False/g, "false");
            return eval("(" + data + ")");
        }
    },

    detectType: function (value) {
        if (this.isNumber(value)) {
            return "number";
        } else if (this.isBoolean(value)) {
            return "bool";
        } else {
            return "string";
        }
    },

    detectCSharpType: function (value) {
        try {
            if (this.isFloatNumber(value)) {
                return "float";
            } else if (this.isInt64Number(value)) {
                return "long";
            } else if (this.isNumber(value)) {
                return "int";
            } else if (this.isBoolean(value)) {
                return "bool";
            } else {
                return "string";
            }
        } catch (e) {
            console.error("Error detecting C# type for value:", value, e);
            return "";
        }
    },

    /**
     * convert value to boolean.
     */
    toBoolean: function (value) {
        if (value == null || value == undefined) return false;
        let v = value.toString().toLowerCase();
        return v.length != 0 && v !== 'undefined' && v !== 'null' && v !== '0' && v !== 'no' && v !== 'false';
    },

    /**
     * is a number.
     */
    isNumber: function (value) {
        if (typeof value === 'number') {
            return true;
        }

        if (value) {
            return !isNaN(+value.toString().trim());
        }
        return false;
    },

    /**
     * is a float number.
     */
    isFloatNumber: function (value) {
        if (value === null || value === undefined) {
            return false;
        }

        let v = value.toString().trim();
        if (v.length === 0) {
            return false;
        }
        if (v.indexOf('.') === -1) {
            return false;
        }
        if (v.indexOf('.') === v.length - 1) {
            return false;
        }
        if (v.indexOf('.') === 0) {
            return false;
        }
        if (v.indexOf('e') !== -1 || v.indexOf('E') !== -1) {
            return false;
        }
        return !isNaN(+v);
    },

    /**
     * is a signed int64 number.
     */
    isInt64Number: function (value) {
        if (value === null || value === undefined) {
            return false;
        }

        let v = value.toString().trim();
        if (v.length === 0) {
            return false;
        }
        if (v.indexOf('.') !== -1) {
            return false;
        }
        if (v.indexOf('e') !== -1 || v.indexOf('E') !== -1) {
            return false;
        }
        if (v.indexOf('-') === 0) {
            v = v.substring(1);
        }
        if (v.length === 0) {
            return false;
        }

        if (/[^0-9]/.test(v)) {
            return false; // contains non-digit characters
        }

        // check if the number is within the int64 range
        const num = BigInt(v);
        if (num <= BigInt(2147483647)) {
            return false;
        }

        if (num > BigInt('9223372036854775807')) {
            return false;
        }

        return !isNaN(+v);
    },

    /**
     * boolean type check.
     */
    isBoolean: function (value) {

        if (typeof (value) === "undefined") {
            return false;
        }

        if (typeof value === 'boolean') {
            return true;
        }

        let b = value.toString().trim().toLowerCase();

        return b === 'true' || b === 'false';
    },

    numdate: function (v) {
        var out = new Date();
        out.setTime(v * 24 * 60 * 60 * 1000 + dnthresh);
        return out;
    },
    //fuck over
};