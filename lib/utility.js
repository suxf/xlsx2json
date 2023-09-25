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
        try
        {
            return eval("(" + data + ")");
        }
        catch(e)
        {
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
            return "int";
        } else if (this.isBoolean(value)) {
            return "bool";
        } else {
            return "string";
        }
    },

    /**
     * convert value to boolean.
     */
    toBoolean: function (value) {
        return value.toString().toLowerCase() === 'true';
    },

    /**
     * is a number.
     */
    isNumber: function (value) {
        if (typeof value === 'number') {
            return true;
        }

        if (value) {
            return !isNaN(+value.toString());
        }
        return false;
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