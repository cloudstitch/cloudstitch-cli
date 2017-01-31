
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
          value: "project-templates/d3-in-a-box"
        },
        {
          name: "Dust",
          value: "project-templates/dust-in-a-box"
        },
        {
          name: "EJS",
          value: "project-templates/ejs-in-a-box"
        },
        {
          name: "Handlebars",
          value: "project-templates/handlebars-widget"
        },
        {
          name: "Jade",
          value: "project-templates/jade-in-a-box"
        },
        {
          name: "Mustache",
          value: "project-templates/mustache-in-a-box"
        },
        {
          name: "Polymer",
          value: "project-templates/polymer-in-a-box"
        }
      ]
    });
  }
  return inquirer.prompt(questions);
}