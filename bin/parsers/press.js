const csv = require('csvtojson');
const path = require('path');
const Prettier = require('prettier');
const Template = require('../template');
const TEMPLATE_PATH = 'bin/templates/press/';
const INTERNAL_PRESS_DIR = 'welcome/directories/press';
/**
 * Take the human readable column names from the spreadsheet and create a
 * data object of key figures for later use
 */
function extractPeopleFigures(input) {
    const press = [];
    input.forEach((item) => {
        const figure = {
            date: item.Date,
            title: item.Title,
            news: item.News,
            article: item.Article,
            topic: item.Topic
        };

        press.push(figure);
    });

    if (press.length === 0) {
        console.error('ERROR: No press releases uploaded.');
        process.exit(1);
    }
    console.log(press.length, ' press releases generated.');
    return press;
}

function generateInternalHTML(press) {
    Template.write(path.join(INTERNAL_PRESS_DIR, 'press.html'), path.join(TEMPLATE_PATH, 'table.hbs'), press);
    Prettier.format(path.join(INTERNAL_PRESS_DIR, 'press.html'), { parser: 'html' });
    return press;
}

/**
 * Read in the figures file and output
 * HTML and JavaScript files
 */
function parse(file) {
    return csv()
        .fromFile(file)
        .then((input) => {
            return extractPeopleFigures(input);
        })
        .then((press) => {
            return generateInternalHTML(press);
        })
        .catch((e) => {
            console.log(e);
        });
}

exports.parse = parse;
exports.file = 'press.csv';
