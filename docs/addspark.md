Setting up a Spark
---
### First of all
Make sure you start que with the `--sparktoken` flag or the `sparktoken` environment
variable to specify the token to send when making spark api calls. Acquire a token
[here](https://www.spark.io/build) (under settings)

### Add the thing
1. Go to que's online web ui (if you don't know where that is its probably at
`[IP OF COMPUTER]:8000` or if you're running it locally it may be at `127.0.0.1:8000`);
2. Click the "Things" tab on the top of the screen
3. Click the green "Add a thing" button
4. Enter in the information for the new thing - here's mine:
![1st screen](docs/spark-new-0.png)
5. After clicking next, You'll be presented with a screen to type in your spark's ID
(you can find this in spark's Web IDE, the same page where you found the spark token above)
![spark id](docs/spark-new-1.png)
6. On the last page, you'll see a map of the spark's pins. Here, you'll be naming each pin
based on what it does/controls. We're going to be controlling the onboard led in this example,
so in the box next to pin D7 type the name `led` (D7 is connected to the onboard LED)
![spark led name](docs/spark-new-2.png)
7. Click Finish!
8. Click on the edit button in the upper right hand corner of the thing, and create a control
with a name of `light` and a type of `button`:
![spark led name](docs/spark-new-4.png)
9. Click the done button
![spark led name](docs/spark-new-5.png)

### Configure the Block
1. Now, click on the "Blocks" tab at the top of the screen
2. Click the red "Add a block" button
3. Enter in a name and a description, and tags as well if you'd like
![spark led name](docs/spark-new-6.png)
4. Click the add button, and then the Edit Code button on the block's card. You'll
want to enter the below code into the editor. Afterwards, click the Save button,
then the Close button.

```javascript
// get any things with the tag 'sparky'
que.getThingByTag("sparky", function(thing, n) {

  // if the light button is selected...
  if (thing.data.ping.value == true) {
    // turn on the light
    que.getActions(thing).led.trigger();
  }

});
```

### The moment of truth
Go back to the "Things" tab, and click the button. If all has been done right, the led
on the spark should turn on. If this doesn't happen, check to make sure you entered the
correct information for the `sparktoken` and the spark's id. Also make sure that you copied
the code into the block, and that the Enable switch on the block is set so it is colored
yellow and says 'Disable'.