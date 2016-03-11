# habitica-tool

Habitica-Tool helps you to determine what spell you should use next and on what task you should use it on.
It checks which task, habit or daily has the best value and tells you how much your gain will be after using the spell.

# Screenshots
![Rogue Spells](/../screenshots/rogue-spells.png?raw=true "Rogue Spells")

![Gear Manager](/../screenshots/gear-manager.png?raw=true "Gear Manager")

![Config](/../screenshots/config.png?raw=true "Config")

# Installation
* Download the [latest release](../../releases/latest)
* Unzip the file
* Open index.html in your browser (IE at least version 9)

# Developing
* clone / fork the project
* ```npm install```

Because of same-origin-policies in new Brewsers, you cannot just open the index_dev.html file in your browser, but you have to use a web server (apache/nginx) to vitit the files.

## Building live versions
To build, I am using [jake](http://jakejs.com/docs). So you can check ```jake -ls``` to see the available options.
