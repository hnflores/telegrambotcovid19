require('dotenv').config()
var Request = require("request");



const Telegraf = require('telegraf')


const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => {
    console.log("Start")
    var mensaje = `Hola ${ctx.update.message.from.first_name}.\nMi nombre es covibot y mi función es mostrar información sobre los casos de covid-19 en los paises afectados. \n` +
        `Tengo las siguientes funciones: \n` +
        `\n` +
        `1) /country y te mostraré el listado de los paises contagiados. \n` +
        `\n` +
        `2) /search (Nombre del pais) y te mostraré el detalle del pais que solicitas.`
    //var response = `Excelente ${ctx.update.message.from.first_name} \nLos resultados son lo siguientes:  \n`;
    //searchAPI(ctx);
    returnMessage(ctx, mensaje)
    //ctx.reply('👍')
})

bot.command(['Countries', 'Country', 'countries', 'country'], (ctx) => {
    console.log("country")
    allCountries(ctx);
})

bot.command(['search'], (ctx) => {
    console.log("search")
    searchCountry(ctx)
})
/* bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there')) */
bot.launch()


function returnMessage(ctx, data) {
    ctx.reply(data);
}

function allCountries(ctx) {
    Request.get("https://api.covid19api.com/countries", (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        console.dir(JSON.parse(body));

        var json = JSON.parse(body);
        var list = Array();

        var contrys = '';
        json.forEach(country => {
            list.push(country.Country);
        });
        console.dir(list);
        list.sort();
        console.dir(list);
        for (var index = 0; index < list.length; index++) {
            const element = list[index];
            contrys += element + '\n';
        }
        returnMessage(ctx, contrys);
    });
}

function searchCountry(ctx) {
    var country = (ctx.update.message.text).replace("/search", "").trim()
    console.log(country)
    Request.get(`https://api.covid19api.com/live/country/${country}`, (error, response, body) => {
        if (error) {
            returnMessage(ctx, 'Tengo problemas para obtener los datos :c');
            return console.dir(error);
        }
        console.dir(body);
        var json = JSON.parse(body);
        var confirmados = 0;
        var recuperados = 0;
        var muertes = 0;
        var activos = 0;
        var response = `Excelente ${ctx.update.message.from.first_name} \nLos resultados son lo siguientes:  \n`;

        console.dir(json);
        var cantidad = (json.length);
        if (cantidad == 0) {
            returnMessage(ctx, 'Pais no encontrado, intenta con otro c:')
            return;
        }
        console.dir(cantidad);
        json = json[cantidad - 1]

        console.dir(json)
        confirmados = json.Confirmed;
        muertes = json.Deaths;
        recuperados = json.Recovered;
        activos = json.Active;
        response += `Confirmados: ${confirmados} \n` +
            `Recuperados: ${recuperados} \n` +
            `Muertes: ${muertes} \n` +
            `Activos: ${activos} \n`

        returnMessage(ctx, response);
    });
}