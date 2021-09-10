# Arduino Robot Virtual Lab


### Installation

  

	npm install

  

### Development

  

Launch development server.

  

	npm start

  

### Add a new element (PushButton + LED example)

For adding a new element, you have to first create a new hbs (at /src) and a new ts (at /src/ts) file.


![](https://github.com/zimomar/Arduino-javascript-simulator/blob/main/src/imgs/servo_ts_hbs.JPG?raw=true)

Then, you have to modify your .hbs file in order to include the wokwi-elements you want to use :
![](https://github.com/zimomar/Arduino-javascript-simulator/blob/main/src/imgs/servo_hbs.JPG?raw=true)
Here we added wokwi-arduino-uno and wokwi-pushbutton.

Then go to the .ts file and create your component Class : 

PushComponent
![](https://github.com/zimomar/Arduino-javascript-simulator/blob/main/src/imgs/pushButtonComponent.JPG?raw=true)

LEDComponent
![](https://github.com/zimomar/Arduino-javascript-simulator/blob/main/src/imgs/ledComponent.JPG?raw=true)

Here we added 2 listeners so the PushButton can recognize when its pressed or not (button-press, button-release). If its pressed, a "true" data will be sent to the button's pin, if its released , then a "false" data will be sent.

Dont forget to add an "Element" attribute (here : pushButtonElement and ledElement) because it will be the "front-end" of our component !

Then we can do this :

![](https://github.com/zimomar/Arduino-javascript-simulator/blob/main/src/imgs/bindings.JPG?raw=true)

We create a pushbuttonElement instance of the PushButtonElement wokwi class, giving him a #button1 id so we can put it on our .hbs file and use it there.

We create a pushCompo instance of our PushComponent class we just made, we put 2 for the pin number, "button1" for the component's label and we put our pushbuttonElement instance.

If its not clear, check again the PushComponent's constructor.

Then we create a unoBoard instance of the ArduinoUno class, this one will be our uno's instance. We can add our component on it with the `addConnection` method.

We add the pushCompo and the ledComponent here and trigger pushComponent's listener.

Once all of this done we can just run the localhost server with the commande `npm start` and you should be able to play with a fonctionnal push-button and LED schema.`