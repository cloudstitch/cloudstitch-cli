var colors = require('colors');

colors.setTheme({
  header: ['green', 'underline', 'bold'],
  command: ['cyan', 'bold'],
  text: 'white',
  bold: 'bold',
  option: 'grey',
  optionDesc: 'grey'
});

const cloudstitch_desc = `\n${"Cloudstitch".bold} creates a magic folder of ordinary documents that powers your website.

Usage: cloudstitch <command>`;

const output =
  [
    {
      "title": "Account Management",
      "commands": [
        {
          "title": "login",
          "description": "Logs in",
          "subcommands": [
            {
              "title": "--status",
              "description": "Checks whether your are logged in."
            },
            {
              "title": "--forgot",
              "description": "Recovers a lost password."
            }
          ]
        },
        {
          "title": "signup",
          "description": "Signs up",
        },
        {
          "title": "link <service>",
          "description": "Links your acount to a third party service.",
          "subcommands": [
            {
              "title": "<service>",
              "description": "github | gitlab | stripe"
            }
          ]
        }
      ]
    },

    {
      "title": "Creating Projects",
      "commands": [
        {
          "title": "create [folder]",
          "description": "Create a new empty project",
          "subcommands": [
            {
              "title": "[folder]",
              "description": "Manually specify the project folder"
            },
            {
              "title": "--url=<url>",
              "description": "Create the project specified by the JSON manifest at <url> "
            },
            {
              "title": "--jsonfile=<jsonfile>",
              "description": "Create the project specified by the JSON manifest at <jsonfile>"
            },
            {
              "title": "--clone=<user/app>",
              "description": "Clone existing project user/app from Cloudstitch"
            },
          ]
        }
      ]
    },

    {
      "title": "Working with Projects",
      "commands": [
        {
          "title": "sync <destination>",
          "description": "Synchronize and convert your cloud folder into a repository",
          "subcommands": [
            {
              "title": "<destination>",
              "description": "local | staging | production"
            }
          ]
        },
        {
          "title": "open <resource>",
          "description": "Open the cloud resource connected to your project",
          "subcommands": [
            {
              "title": "<resource>",
              "description": "project | folder | sheet"
            }
          ]
        }
      ]
    },

    {
      "title": "Project Metadata",
      "commands": [
        {
          "title": "list <resource>",
          "description": "Lists information about your project or account.",
          "subcommands": [
            {
              "title": "<resource>",
              "description": "projects"
            }
          ]
        },
        {
          "title": "remove <resource>",
          "description": "Removes a resource from your account.",
          "subcommands": [
            {
              "title": "<resource>",
              "description": "project"
            }
          ]
        },
        {
          "title": "get <resource> settings",
          "description": "Gets the settings for a particular aspect of your project.",
          "subcommands": [
            {
              "title": "<resource>",
              "description": "api | folder | publish"
            }
          ]
        },
        {
          "title": "set <resource> settings --jsonfile=<filename>",
          "description": "Saves the settings for a particular aspect of your project.",
          "subcommands": [
            {
              "title": "<resource>",
              "description": "api | folder | publish"
            }
          ]
        }
      ]
    }
  ]

const padding = 3;
export function usage() {
  let ret = '';
  let margin = 0;

  for (let block of output) {
    for (let cmd of block.commands) {
      margin = Math.max(margin, cmd.title.length);
    }
  }

  margin += padding;
  let marginString = '';
  for (let i = 0; i < margin; i++) {
    marginString += ' ';
  }

  for (let block of output) {
    ret += header(block.title);
    for (let cmd of block.commands) {
      ret += command(marginString, margin, cmd.title, cmd.description, cmd['subcommands']);
   }
    ret += '\n';
  }  
  console.log(`${cloudstitch_desc}
  
${ret}`);
}

function header(name) : string {
  return name.header + '\n\n';
}

function command(marginString:string, margin:number, cmd, desc, sc) : string {
  var padding = '';
  for (let i = cmd.length; i < margin; i++) {
    padding += ' ';
  }

  let ret = cmd.command + padding + desc + '\n';
  if (sc) {
    
    const scpadding = 2;
    let scmargin = 0;

    for (let s of sc) {
      scmargin = Math.max(scmargin, s.title.length);
    }

    scmargin += scpadding;
    let scmarginString = '';
    for (let i = 0; i < scmargin; i++) {
      scmarginString += ' ';
    }

    for (let s of sc) {
      var scspace = '';
      for (let i = s.title.length; i < scmargin; i++) {
        scspace += ' ';
      }
      
      ret += marginString + s.title.option + scspace + s.description.optionDesc + "\n";
    }
  }
  return ret;
}