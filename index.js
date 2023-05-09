/*
  Author: Si Young Sung
*/
let path = require("path");
let fs = require("fs");
let bodyParser = require("body-parser");
let express = require("express"); /* Accessing express module */
let app = express(); /* app is a request handler function */
let read = 0
let questionsPrompt = [];
let answersRepo = [];
const port = process.env.PORT || 4000;

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'))
app.use(express.json())

function readLinesFromFile(filePath) {
    return new Promise((resolve, reject) => {
      const lines = [];
      const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      readStream.on('data', function(chunk) {
        const linesInChunk = chunk.split('\n');
        lines.push(...linesInChunk);
      });
      readStream.on('end', function() {
        console.log(`successfully read file(${filePath})!`)
        resolve(lines);
      });
      readStream.on('error', function(err) {
        reject(err);
      });
    });
  }
  
app.get("/", async function (request, response) {
    try {
        if(read == 0){
            questionsPrompt = await readLinesFromFile('questions.txt');
            answersRepo = await readLinesFromFile('answers.txt');
            answersRepo = answersRepo.map(x => x + '|')
            //console.log(answersRepo)
            read = 1
        }
        let variables = {
            questions: questionsPrompt
        }
        response.render("index", variables);
      } catch (err) {
        console.error('Error reading file:', err);
      }
});

app.post("/submit", function (request, response){
    let {randomQuestion} = request.body;
    randomQuestion = (randomQuestion == "on" ? true : false)

    let variables = {
        questions: questionsPrompt,
        answers: answersRepo,
        random: randomQuestion
    }
    response.render("questions", variables);
});

app.listen(port, () => {
    console.log(`running on port ${port}`)
})


