'use strict';

const express=require('express');
require('dotenv').config();
const server=express();

const pg=require('pg');
const superagent = require('superagent');
const methodOverride=require('method-override');
const cors=require('cors');

const PORT=process.env.PORT || 3030;

server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));
server.use(express.static('./public'));
server.set('view engine', 'ejs');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });

server.get('/' , homehandeld)
function homehandeld(req ,res)
{
let url=`https://jobs.github.com/positions.json?location=usa`;
superagent(url)
.then(result => {
    let data=result.body.map(val => {
        return new Job(val);
    });
    res.render('pages/index' ,{data :data});
});

}

function Job(data)
{

    this.title=data.title;
    this.company=data.company;
    this.location=data.location;
    this.url=data.url;
    this.description=data.description;
}


server.get('/SearchPage' , searchhandeld)
function searchhandeld(req ,res)
{
    res.render('pages/search');
}

server.get('/Resultspage' ,resulthandeld)
function resulthandeld(req ,res)
{
    let searchs=req.query.search;
    let url=`https://jobs.github.com/positions.json?description=${searchs}&location=usa`;
    superagent(url)
    .then(result =>{
        console.log(result.body);
        let data=result.body.map(val => {
            return new Job(val);
        });
        res.render('pages/result' ,{data :data});
    });
}


server.get('/mylist' ,mylisthandled)
function mylisthandled(req ,res)
{
    let{title ,company ,location,url ,description}=req.query;
    let sql=`INSERT INTO job(title ,company ,location,url ,description)
    VALUES ($1, $2, $3 , $4,$5) RETURNING *;`;
    let save=[title ,company ,location,url ,description];
    client.query(sql ,save)
    .then(result =>{
        res.redirect(`/savelist`);
});

}

server.get('/savelist' ,savehandled)
function savehandled(req ,res)
{
    let sql=`SELECT * FROM job ;`;
    client.query(sql)
    .then(result=>{
        res.render('pages/save' ,{data :result.rows});
    })
}

server.get('/details/:id' , detailshandled)
function detailshandled(req,res)
{
    let sql=`SELECT * FROM job WHERE id=$1 ;`;
    let save=[req.params.id]
    client.query(sql ,save)
    .then(result=>{
       
        res.render('pages/deatils' ,{data :result.rows[0]});
    })
}

server.get('/update/:id' ,updateidhandled)
function updateidhandled(req ,res)
{
    let{title ,company ,location,url ,description}=req.query;
    let sql=`UPDATE  job SET title=$1 ,company=$2 ,location=$3,url=$4 ,description=$5 WHERE id=$6;`;
    let save=[title ,company ,location,url ,description ,req.params.id];
    client.query(sql ,save)
    .then(result =>{
        res.redirect(`/details/${req.params.id}`);
});

}

server.get('/delete/:id' , deletehandled)
function deletehandled(req,res)
{
    let sql=`DELETE  FROM job WHERE id=$1 ;`;
    let save=[req.params.id]
    client.query(sql ,save)
    .then(result=>{
       
        res.redirect(`/savelist`);
    })
}















server.get('*' , (req ,res) => 
{
    res.send('THERE ARE SOMETHING ERROR');
});


client.connect()
.then(() => 
{
    server.listen( PORT ,() => {
      console.log(`LISTINIG IN YOUR PORT ${PORT}`);
    });
})
