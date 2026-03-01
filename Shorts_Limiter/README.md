# YouTube Shorts Limiter

A lightweight Chrome extension that limits YouTube Shorts usage by automatically redirecting users to the YouTube homepage after a set number of Shorts.

---

## Overview

YouTube Shorts are designed for infinite scrolling, which can easily consume more time than intended. This extension helps users regain control by:

- Tracking the number of Shorts viewed
- Automatically redirecting users after reaching a preset limit
- Encouraging intentional rather than passive usage

---

## Features

- Real-time Shorts view counter  
- Automatic redirect after limit is reached  
- Lightweight and efficient  
- Runs automatically in the background  
- No external APIs required  

---

## Built With

- JavaScript  
- HTML  
- PNG
- Chrome Extension Manifest V3  
- 

---

## Project Structure

- youtube-shorts-limiter/
    ├── manifest.json      # Extension metadata and permissions (MV3)
    ├── background.js      # Service worker handling redirects and state
    ├── content.js         # Script injected into YouTube to detect Shorts
    ├── popup.html         # The UI shown when clicking the extension icon
    ├── popup.js           # Logic for setting limits and viewing stats
    ├── icon.png           # Extension logo
    └── assets/            # Documentation images and demos
