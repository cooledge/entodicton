# Running a Freenove Drone with Voice

## Setup

1. copy main.py and command.py in freenove/src/freenove to ~/Freenove_Tank_Robot_Kit_for_Raspberry_Pi/Code/Server
2. start the server on the freenove drone, "sudo QT_QPA_PLATFORM=offscreen python main.py"
3. run configure the drone. node drone --calibrate . The calibration is saved so this can be skipped. Also works better on fresh batteries and the calibration gets worse as the batteries drine. Its a little hacky but the drone was inexpensive and this is just a POC.

## Two Choice - run on command line or using voice

### Choice 1: Running using the command line

4. Run "node freenove" then type in commands to the drone

### Choice 2: Running using the voice interface

4. Run "node freenove --voice"
5. Run voice/main.py . then voice can be used to command the drone
