const cheerio = require('cheerio');
const express = require('express');
const axios = require('axios');


const PORT = process.env.PORT || 8000

const app = express();

const newspapers = [
    {
        name: "thetimes",
        address: "https://www.thetimes.co.uk/environment/climate-change",
        base: ''
    },
    {
        name: "telegraph",
        address: "https://www.telegraph.co.uk/climate-change",
        base: "https://www.telegraph.co.uk"
    },
    {
        name: "guardian",
        address: "https://www.theguardian.com/environment/climate-crisis",
        base: ''
    }
]

let articles = [];
let specifiedArticles = [];

//loop throught the array and get each newspapers address and pass it to the axios url
newspapers.forEach(newspaper => {

    axios.get(newspaper.address)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            $('a:contains("climate")', html).each( function () {
                const title = $(this).text();
                const link = $(this).attr('href');
            const data = {
                title,
                link: newspaper.base + link,
                source: newspaper.name
            }
            articles.push(data);
        })
    })
    .catch((err) => {
        console.log(err)
    })
})


//route to get the data from the url
app.get('/', (req, res) => {
    res.json('Welcome to my climate API')
})


app.get('/news', (req, res) => {
    res.json(articles)   
})

app.get('/news/:newspaperId', async (req, res) => {
    const newspaperId = req.params.newspaperId
    const newspaperAddress =  newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base

    axios.get(newspaperAddress)
    .then(response => {
        const html = response.data
        const $ = cheerio.load(html)

        $('a:contains("climate")', html).each( function() {
            const title = $(this).text()
            const link = $(this).attr('href')

            const data = {
                title,
                link: newspaperBase + link,
                source: newspaperId
            }

            specifiedArticles.push(data)
        })
        res.json(specifiedArticles)
    }).catch(err => console.log(err))
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    }
);

