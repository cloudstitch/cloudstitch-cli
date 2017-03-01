
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
