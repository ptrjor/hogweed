     /* in this onground

        console.log("kollisjon " + this.y + " mgpy: " + myGamePiece.y)
            if(this.y > myGamePiece.y)
            {
                console.log("kollisjon")
                this.y = myGamePiece.y - this.height;
                return true;
            } */
            /* Her settes "rockbottom" for playerobjektene cirka til y-verdien til daxtrot, altså mygamepiece.y. 
             når playerobjektene treffer denne blir de reseta til deres standard y-verdi som du ser under testing. 
             Den bør vel heller settes til y-verdien til daxtrot, eller noe liknende. Ærlig talt litt for mye testing fram 
             og tilbake her uten å ha en helt krystallklar plan for hva ting bør gjøre. Derfor sier jeg det er rotete - så du 
             får gjøre hva du vil ut av det. Gjerne re-design dette om du synes dette blir feil. Veldig usikker selv. */

            //rockbottom = myGamePiece.y - myGamePiece.height/2; 