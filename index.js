let apiKey = "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"
let path = require("path");
let fs = require("fs");
let bodyParser = require("body-parser");
let express = require("express"); /* Accessing express module */
let app = express(); /* app is a request handler function */
let read = 0
let questionsPrompt = [];
let answersRepo = [];
const port = process.env.PORT || 4000;

/* openai */
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);


let currdate = function(){
    today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();

    if(dd<10) dd='0'+dd;
    if(mm<10) mm='0'+mm;
    return (yyyy+'-'+mm+'-'+dd);
};

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
        console.log("read file!")
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

app.post("/checkAnswerAI", async function (request, response){
  console.log("we here dog")
  let {originalQuestion, originalAnswer, userAnswer} = request.body
  let message = [
    {role: "user", content: `Here is a question from Civics (History and Government) Questions for the Naturalization Test:
    ${originalQuestion}

    Here are the list of correct answers to the question:
    ${originalAnswer}

    A person answered the question with:
    ${userAnswer}
    with a margin of small grammatical error, is this answer a passable answer to this question? Please respond with a yes or no, followed by an explanation`},
    ]

    let completion;
    try {
        completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: message
        });
    } catch (error) {
        console.log(error);
    }
    let ans = completion.data.choices[0].message['content']
    console.log("chat-gpt answers it with " + ans)
    response.send(JSON.stringify({response: ans}));
});



app.listen(port, () => {
    console.log(`running on port ${port}`)
})


