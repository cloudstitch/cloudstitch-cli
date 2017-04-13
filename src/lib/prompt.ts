
import * as inquirer from "inquirer";

export function prompt(frontEndStack = false) {
  let questions = [
    {
      type: "input",
      name: "title",
      validate: function (value) {
        var pass = value.length !== 0;
        if (pass) {
          return true;
        }

        return 'Please enter a title';
      },
      message: "What do you want to name your new project?"
    },
    {
      type: "list",
      name: "backend",
      message: "Select your backend stack for data:",
      choices: [
        {
          name: "Google Docs",
          value: "google"
        },
        {
          name: "Microsoft Office",
          value: "microsoft"
        }
      ]
    }
  ];
  if(frontEndStack) {
    questions.push( {
      type: 'list',
      name: 'stack',
      message: 'Choose your frontend stack for rendering and logic:',
      choices: [
        {
          name: "D3 + Handlebars",
          value: "d3"
        },
        {
          name: "Dust",
          value: "dust"
        },
        {
          name: "EJS",
          value: "ejs"
        },
        {
          name: "Handlebars",
          value: "handlebars"
        },
        {
          name: "Jade",
          value: "jade"
        },
        {
          name: "Mustache",
          value: "mustache"
        },
        {
          name: "Polymer",
          value: "polymer"
        }
      ]
    });
  }
  return inquirer.prompt(questions);
}

export function promptUse() {
  let questions = [
    {
      type: 'list',
      name: 'environment',
      message: 'Where do you want to use this widget?',
      choices: [
        {
          name: "On an HTML Page",
          value: "html"
        },
        {
          name: "In an IFrame",
          value: "iframe"
        },
        {
          name: "In WordPress",
          value: "wordpress"
        },
        {
          name: "In SquareSpace",
          value: "squarespace"
        },
        {
          name: "In Weebly",
          value: "weebly"
        },
        {
          name: "In Google Sites",
          value: "googlesites"
        }
      ]
    }
  ];
  return inquirer.prompt(questions);
}

export function configPublishPrompt() {
  let questions = [
    {
      type: "input",
      name: "repoUrl",
      message: "Github repo url"
    },{
      type: "input",
      name: "repoBranch",
      message: "git branch",
      default: "master"
    }/*,{
      type: "confirm",
      name: "publishData",
      message: "publish spreadsheet data?"
    },{
      type: "input",
      name: "publishDataPath",
      message: "data repo path",
      when: (options) => options.publishData
    },{
      type: "confirm",
      name: "publishFiles",
      message: "publish documents?"
    },{
      type: "input",
      name: "publishFilesPath",
      message: "data repo path",
      when: (options) => options.publishFiles
    }*/
  ];
  return inquirer.prompt(questions);
}

export function prePublish(message: string) {
  let questions = [
    {
      type: "confirm",
      name: "publish",
      message: message
    }
  ];
  return inquirer.prompt(questions);
}


/*
    if (lio.event.frontEnd && (lio.event.fromUser == 'project-templates') && (lio.event.fromApp == 'starter-widget')) {
      switch (lio.event.frontEnd) {
        case 'd3':
          lio.event.fromUser = 'visualizations';
          lio.event.fromApp = 'd3-bar-chart';
          break;
        case 'dust':
          lio.event.fromApp = 'dust-in-a-box';
          break;
        case 'ejs':
          lio.event.fromApp = 'ejs-in-a-box';
          break;
        case 'handlebars':
          lio.event.fromApp = 'handlebars-in-a-box';
          break;
        case 'jade':
          lio.event.fromApp = 'jade-in-a-box';
          break;
        case 'mustache':
          lio.event.fromApp = 'mustache-in-a-box';
          break;
        case 'polymer':
          lio.event.fromApp = 'polymer-in-a-box';
          break;
        default:
          lio.event.fromApp = 'handlebars-in-a-box';
      }
*/
