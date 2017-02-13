# cloudstitch-cli

## Install

```
npm install -g @cloudstitch/cli
```

The Cloudstitch CLI provides command line access to Cloudstitch, as well as a web server to facilitate easy development of widgets.

## Commands

The following commands can be invoked by typing `cloudstitch <command>` on the command line.

No login required:

* `pull user/app` - Pulls down files to local disk
* `serve` - Serves the current directory as a Cloudstitch widget.
* `signup` - Helps you create and log into a new Cloudstitch account
* `login` - Helps you log into Cloudstitch save your API key to ~/.config/cloudstitch.json
 
Login required:

* `clone <user>/<app> [folder]` - Clones the user/app on Cloudstitch and does a pull into `[folder]`. If `[folder]` is not specificed, creates one named `<app>`. 
* `create` - Helps you create a new app based on one of seven base project types.
* `push [filename]` - Pushes `[filename]` (default: all files) to the remote Cloudstitch project.

## Cloudstitch Package format 

Cloudstitch project record information in a `cloudstitch.json` file stored at the project root.

Available properties:

* `user` - The username of the widget instance on Cloudstitch
* `app` - The appname of the widget instance on Cloudstitch
* `kind` - The type of widget (`widget` | `jekyll`, etc.)

## Authentication and Configuration

Your command line configuration, including API key, is stored in file called `~/.config/cloudstitch.json`.

The format of the config file is:

```json
{
  "ApiKey": "Your API Key"
}
```
