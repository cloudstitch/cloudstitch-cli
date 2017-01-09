# cloudstitch-cli

`clone user/app`

Clones the user/app remotely, and then does a pull

`pull user/app`

Pulls down the files to local disk

`serve`

Serve the widget locally, using data from `api.cloudstitch.com/$USER/$SPP`.

`clone user/app`

Clones

`login`

Logs in and saves key to ~/.cloudstitch

`push`

Pushes the local directory up to cloudstitch

## Package format 

{
  user: username
  app: appname
}

## Config

Stored as a json file in `./.cloudstitch` or `~/.cloudstitch` (in that order of lookup)

```
{
  key: key
  user: user
}
```


