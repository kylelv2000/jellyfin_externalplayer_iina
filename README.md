# jellyfin_externalplayer_iina

 Add a button to the Jellyfin video info page that plays using the external player iina
 
<img width="354" alt="QQ20220407-095945@2x" src="https://user-images.githubusercontent.com/33082768/162105320-0318ab4b-d937-4ad1-bab1-e67bbed798c3.png">


1. Find Jellyfin's Web folder on the server. You can use `find / -name jellyfin` to search for its location. 
2. Open the corresponding folder and you will see a folder called `web`, then open it.
3. Upload `external_player.js` here.
4. Modify the `index.html` file under the folder.
5. Add `<script src="external_player.js" ></script>`at the end of the file before `</body>`.
6. Save the `index.html` file.
