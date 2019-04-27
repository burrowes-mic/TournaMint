/***************************
 * SERVER INITIALIZATION
 ***************************/

console.log("Initializing TournaMint...");

const express       = require('express');
const pug           = require('pug');
const file_system   = require('fs');
const morgan        = require('morgan');
const cookie_parser = require('cookie-parser'); //unneeded
const body_parser   = require('body-parser');   //unneeded
const fs            = require('fs');
const path          = require('path');
const assert        = require('assert');
const xml2js        = require('xml2js');
const util          = require('util');
console.log("Middleware imported succesfully...");

const app = express();
app.use(morgan('dev'));
app.set('view engine', 'pug');
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));
console.log("Express app initialized...");

const default_port = 8080;
var port = process.env.PORT || default_port;


/***************************
 * READ TOURNAMENT DATA
 ***************************/

assert(process.argv.length == 3, "No data file specified!");
const data_fp = path.join(__dirname, process.argv[2]);

var current_phase = 0;
var tournament_data = {contentants: {}, phases: []};

fs.readFile(data_fp, {encoding: 'utf-8'}, function(error, data) {
    assert(!error, "Unable to read tournament file!");
    xml2js.parseString(data, {explicitArray: false, mergeAttrs: true}, function(error, result) {

        result.tournament.contestant.forEach(function(contestant) {
            tournament_data.contestants[contestant.id] = {
                id = contestant.id,
                fname = contestant.fname,
                lname = contestant.lname,
                age = contestant.age,
                origin = contestant.origin,
                matches = [],
                wins = [],
                loses = [],
                score = 0
            };
        });

        result.tournament.phase.forEach(function(phase) {
            var previousPassingCount;
            if(tournament_data.phases.length == 0)
                previousPassingCount = Object.keys(tournament_data.contentants).length;
            else
                previousPassingCount = tournament_data.phases[tournament_data.phases.length - 1].passingCount;

            switch(phase.type)
            {
            case "round-robin":
                var maxGroupCount = phase.maxGroupCount;
                var maxGroupSize = phase.maxGroupSize;
                assert(previousPassingCount <= max_group_count * max_group_size, "Too many contestants for round robin phase!");
                
                var bestCase = optimizeRoundRobin(maxGroupCount, maxGroupSize, previousPassingCount);
                assert(bestCase.groupCount > 0);

                var match_count = 0;
                for(var i = 0; i < group.member.length; ++i)
                {
                    for(var j = i + 1; j < group.member.length; ++j)
                    {
                        var name = "Group " + group.name + ", Match " + (match_count + 1);
                        ++match_count;
                        tournament_data.matches.push({id: name, c1: group.member[i].id, c2: group.member[j].id});
                    }
                }
                tournament_data.phases.push({passingCount: phase.passingCount})
                break;

            case "double-elimination":
                assert(phase.allowByes || Math.log(previousPassingCount)/Math.log(2) % 1 != 0, "Bracket must alloe byes or have 2^n contestants!");

                tournament_data.phases.push({passingCount: 1})
                break;
            }
        });

        result.tournament.rrgroup.forEach(function(group) {
            var match_count = 0;
            tournament_data.groups[group.id] = {};
            for(var i = 0; i < group.member.length; ++i)
            {
                for(var j = i + 1; j < group.member.length; ++j)
                {
                    var name = "Group " + group.name + ", Match " + (match_count + 1);
                    ++match_count;
                    tournament_data.matches.push({id: name, c1: group.member[i].id, c2: group.member[j].id});
                }
            }
        });

        result.tournament.match.forEach(function(match) {

        });

        console.log(util.inspect(tournament_data, false, null));
    });
});

app.get('/', (request, response) => {
    response.render('home.pug', {contestants: tournament_data.contestant});
});

/***********************************
 * ROSTER
 **********************************/

app.get('/roster', (request, response) => {
    response.render('roster.pug', {employees: employee_cache});
});

app.get('/api/employee/details', (request, response) => {
    console.log(employee_cache[request.query.email].first);
    response.json(employee_cache[request.query.email]);
});




app.get('/scheduler', (request, response) => {
    response.render('scheduler.pug', {});
});

app.post('/api/employee/add', (request, response) => {
    console.log(request.body);
    employee = {first:request.body.first, last:request.body.last, email:request.body.email}
    db_mods.addEmployeeData(employee, (res) => {
        refreshCache((cache) => {
            response.json(res);
        });
    });
});

app.delete('/api/employee/delete', (request, response) => {
    console.log("Deleting: "+ (request.query.email));
    db_mods.deleteEmployee({email:request.query.email}, (res) => {
        refreshCache((cache) => {
            response.json(res);
        });
    });
});

app.get('/api/employee/find', (request, response) => {
    var callback = (res) => {
        response.json(res);
    };
    console.log("Searching with the following query:");
    for (var key in request.query) {
        if (request.query.hasOwnProperty(key))
            console.log(key + " -> " + request.query[key]);
    }
    db_mods.findEmployeeData(request.query, callback);
});

app.listen(port, () => {
    console.log("Listening on port " + port + ".");
})

console.log("Initialization complete.");