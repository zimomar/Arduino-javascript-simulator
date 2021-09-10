# Arduino Robot Virtual Lab


### Installation

  

	npm install

  

### Development

  

Launch development server.

  

	npm start

  

### Add a new element (PushButton + built-in LED example)

For adding a new element, you have to first create a new hbs (at /src) and a new ts (at /src/ts) file.


![](https://github.com/zimomar/Arduino-javascript-simulator/blob/main/src/imgs/servo_ts_hbs.JPG?raw=true)

Then, you have to modify your .hbs file in order to include the wokwi-elements you want to use :

![](https://github.com/zimomar/Arduino-javascript-simulator/blob/main/src/imgs/servo_hbs.JPG?raw=true)

Here we added wokwi-arduino-uno and wokwi-pushbutton.

Then go to the .ts file and create your component Class : 

PushComponent class

![](https://github.com/zimomar/Arduino-javascript-simulator/blob/main/src/imgs/pushButtonComponent.JPG?raw=true)


Here we added 2 listeners so the PushButton can recognize when its pressed or not (button-press, button-release). If its pressed, a "true" data will be sent to the button's pin, if its released , then a "false" data will be sent.

Dont forget to add an "Element" attribute (here its pushButtonElement ) because it will be the "front-end" of our component !

Then we can do this :

![](https://github.com/zimomar/Arduino-javascript-simulator/blob/main/src/imgs/bindings.JPG?raw=true)

We create a pushbuttonElement instance of the PushButtonElement wokwi class, giving him a #button1 id so we can put it on our .hbs file and use it there.

We create a pushCompo instance of our PushComponent class we just made, we put 2 for the pin number, "button1" for the component's label and we put our pushbuttonElement instance.

If its not clear, check again the PushComponent's constructor.

Then we create a unoBoard instance of the ArduinoUno class, this one will be our uno's instance. We can add our component on it with the `addConnection` method.

We add the pushCompo to the unoBoard, at pin 2 and trigger pushComponent's listener.

Once all of this done we can just run the localhost server with the commande `npm start` .

The code we used : 
      //setup global variables here
      int button = 2; // Choose the button pin. You can choose any other pin.
      //int LED_BUILTIN = 13; // We have chosen the builtin led pin.
      // the setup function runs only one time in the startup of your board.
      void setup() {
      pinMode(button, INPUT);// initialize digital pin button as an input.
      pinMode(LED_BUILTIN, OUTPUT);// initialize digital pin led as an output.
      }
      // the loop function runs over and over again forever
      void loop() {
      int state = digitalRead(button);
      if (state == HIGH) {
      digitalWrite(LED_BUILTIN, HIGH);   // turn the LED on (HIGH is the voltage level)
        } else {
      digitalWrite(LED_BUILTIN, LOW);    // turn the LED off by making the voltage LOW
        }
      }

Put the code on the arduino code container and you should be able to play with a fonctionnal schema of a push-button that triggers the built-in uno's LED.