const convertStringToLocaleDate = (dateAsString = new Date().toString(), locale) => {
    return new Date(dateAsString).toLocaleDateString(locale);
}

const convertStringToLocaleDateTimeString = (dateAsString = new Date().toString(), locale) => {
    return new Date(dateAsString).toLocaleString(locale);
}

const getCurrentDate = () => {
    return new Date();
}

const getCurrentDateAsISOString = () => {
    return getCurrentDate().toISOString();
}


const timeAgo  = (time, shortType = false) => {
    switch (typeof time) {
        case 'number':
            break;
        case 'string':
            time = +new Date(time);
            break;
        case 'object':
            if (time.constructor === Date) time = time.getTime();
            break;
        default:
            time = +new Date();
    }
    const time_formats = shortType?[
        [60, 's', 1], // 60
        [120, '1 m', '1 m'], // 60*2
        [3600, 'm', 60], // 60*60, 60
        [7200, '1 h', '1 h'], // 60*60*2
        [86400, 'h', 3600], // 60*60*24, 60*60
        [172800, '1 d', 't'], // 60*60*24*2
        [604800, 'd', 86400], // 60*60*24*7, 60*60*24
        [1209600, '1 w', '1 w'], // 60*60*24*7*4*2
        [2419200, 'w', 604800], // 60*60*24*7*4, 60*60*24*7
        [4838400, '1 m', '1 m'], // 60*60*24*7*4*2
        [29030400, 'm', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
        [58060800, '1 y', 'y'], // 60*60*24*7*4*12*2
        [2903040000, 'y', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
        [5806080000, 'l.c', 'n.c'], // 60*60*24*7*4*12*100*2
        [58060800000, 'c', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
    ]:[
        [60, 'seconds', 1], // 60
        [120, '1 minute ago', '1 minute from now'], // 60*2
        [3600, 'minutes', 60], // 60*60, 60
        [7200, '1 hour ago', '1 hour from now'], // 60*60*2
        [86400, 'hours', 3600], // 60*60*24, 60*60
        [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
        [604800, 'days', 86400], // 60*60*24*7, 60*60*24
        [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
        [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
        [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
        [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
        [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
        [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
        [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
        [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
    ];
    let seconds = (+new Date() - time) / 1000,
        token = shortType?"" : 'ago',
        list_choice = 1;

    if (seconds === 0) {
        return 'Just now'
    }
    if (seconds < 0) {
        seconds = Math.abs(seconds);
        token = 'from now';
        list_choice = 2;
    }
    let i = 0,
        format;
    while (format = time_formats[i++])
        if (seconds < format[0]) {
            if (typeof format[2] == 'string')
                return format[list_choice];
            else
                return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
        }
    return time;
}

function convertDateToInputValue(date) {
    //<input type="date">the browsers support only value in the format yyyy-mm-dd
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    let year = date.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}


module.exports = {
    convertDateToInputValue,
    convertStringToLocaleDate,
    convertStringToLocaleDateTimeString,
    getCurrentDate,
    getCurrentDateAsISOString,
    timeAgo
};
