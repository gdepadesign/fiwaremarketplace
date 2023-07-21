const Handlebars = require('handlebars');
const path = require('path');
const fs = require('fs-extra');
const _ = require('underscore');

/**
 *  Take a raw dump of an Object as JSON
 */
function stringify(data) {
    return JSON.stringify(data);
}

function createAnchor(data, type, index) {
    if (index < data.length - 1) {
        if (type !== data[index + 1].type) {
            return `<a id="${createClass(data[index + 1].type)}-enablers" class="hidden"></a>`;
        }
    }
    return '';
}

/**
 * Remove special characters and create
 * a usable CSS class for Isotope to filter on.
 */
function createClass(data) {
    let result = '';
    const regex = /([^a-zA-Z0-9À-ÿ])/gi;
    if (typeof data == 'object') {
        data.forEach((element, i) => {
            if (i + 1 === data.length) {
                result += `${element.toLowerCase().replace(regex, '-')}`;
            } else {
                result += `${element.toLowerCase().replace(regex, '-')} `;
            }
        });
    } else {
        result = data ? data.toLowerCase().replace(regex, '-') : '';
    }
    return result;
}

/**
 * Add multiple Isotope usable CSS classes for an
 * input array
 */
function createClasses(data) {
    return _.map(data, function(el) {
        return createClass(el);
    }).join(' ');
}

/**
 * Create a star rating from an integer
 */
function rating(difficulty) {
    let result = '';
    for (let i = 0; i < difficulty; i++) {
        result += '★ ';
    }
    return result;
}

function math(lvalue, operator, rvalue) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
    return {
        '+': lvalue + rvalue,
        '-': lvalue - rvalue,
        '*': lvalue * rvalue,
        '/': lvalue / rvalue,
        '%': lvalue % rvalue
    }[operator];
}

Handlebars.registerHelper('createClasses', createClasses);
Handlebars.registerHelper('createClass', createClass);
Handlebars.registerHelper('createAnchor', createAnchor);
Handlebars.registerHelper('rating', rating);
Handlebars.registerHelper('json', stringify);
Handlebars.registerHelper('math', math);

Handlebars.registerHelper({
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
        return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    }
});

/**
 * Output strucuted data using a Handlebars template file
 */
function write(filename, template, input) {
    readTemplate(template, function(err, data) {
        if (!err) {
            const template = Handlebars.compile(data);

            const output = template(input);

            fs.ensureFileSync(filename);
            fs.writeFile(filename, output, function(err) {
                if (err) return console.log(err);
            });
        } else {
            console.log(err);
        }
    });
}

/**
 * Read in a Handlebars template
 */
function readTemplate(template, callback) {
    const filePath = path.join(__dirname, '..', template);
    fs.readFile(filePath, { encoding: 'utf-8' }, callback);
}

exports.write = write;
