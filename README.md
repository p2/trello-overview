Trello Card Overview
====================

Simple JavaScript web app that pulls all cards that you are a member of, by board, and lists them by due date (if any).
Very very basic at the moment.

API Key
-------

This app uses the [trello.js](https://trello.com/docs/gettingstarted/clientjs.html) client, which requires an API key.
You will have to [generate your own key](https://trello.com/docs/index.html) and paste it into `index.html` in place of _YOUR_API_KEY_.
This git repo is set up to always replace that line of code without your API key by using `hidekey.sh`, as [outlined here](http://stackoverflow.com/questions/6782017/whats-the-easiest-way-to-deal-with-project-configuration-files/21393992#21393992).
