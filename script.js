import {Piece} from "./piece.js";

//créons le plateau qui servira à toutes les manipulations d'objet------------------------------------------------------
let plateau = [
    [
        new Piece('tower','white'),
        new Piece('knight','white'),
        new Piece('bishop','white'),
        new Piece('king','white'),
        new Piece('queen','white'),
        new Piece('bishop','white'),
        new Piece('knight','white'),
        new Piece('tower','white')
    ],
    [
        new Piece('pawn','white'),
        new Piece('pawn','white'),
        new Piece('pawn','white'),
        new Piece('pawn','white'),
        new Piece('pawn','white'),
        new Piece('pawn','white'),
        new Piece('pawn','white'),
        new Piece('pawn','white')
    ],
    [],[],[],[],
    [
        new Piece('pawn','black'),
        new Piece('pawn','black'),
        new Piece('pawn','black'),
        new Piece('pawn','black'),
        new Piece('pawn','black'),
        new Piece('pawn','black'),
        new Piece('pawn','black'),
        new Piece('pawn','black')
    ],
    [
        new Piece('tower','black'),
        new Piece('knight','black'),
        new Piece('bishop','black'),
        new Piece('queen','black'),
        new Piece('king','black'),
        new Piece('bishop','black'),
        new Piece('knight','black'),
        new Piece('tower','black')
    ],
]

//ajoutons la version "Front" du tableau
const main = document.querySelector('main');

//commençons par colorier et nommer chacune de nos cases----------------------------------------------------------------
const lines = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
for(let i = 0; i < 8; i++){
    main.appendChild(document.createElement('div'));
    for(let j = 0; j < 8; j++){
        let current_line = document.querySelector('main>div:last-child');
        current_line.appendChild(document.createElement('div'));
        let current_cell = current_line.querySelector('div:last-child');

        current_cell.classList.add(lines[i]+j);

        if((i % 2 === 1 && j % 2 === 0) || (i % 2 === 0 && j % 2 === 1)){
            current_cell.classList.add('black');
        }
    }
}

//fonction pour actualiser l’affichage du tableau-----------------------------------------------------------------------
function update(){
    document.querySelectorAll('main>div').forEach((row, i) => {
        row.querySelectorAll('div').forEach((cell, j) => {
            cell.classList.remove('white');
            if(plateau[i][j] instanceof Piece){
                cell.innerHTML = plateau[i][j].type;
                if(plateau[i][j].color === 'white'){
                    cell.classList.add('white');
                }
            }else{
                cell.innerHTML = "";
            }
        })
    })
}
update();

//implémentons un système de case active/pas active---------------------------------------------------------------------

//toutes les cellules du plateau
const divs = document.querySelectorAll('main>div div');

//transformer une div en coordonnées du plateau
function getCoordinates(div) {
    let cell = div.classList[0];
    let coordinates = Piece.toTuple(cell);
    return [coordinates[0],coordinates[1]];
}

//variables utiles hors boucle pour sauvegarder des trucs
let current_active;
let pm = [];
let last_piece = [];

//à chaque cellule du plateau
divs.forEach(div => {

    //au clic sur le plateau
    div.addEventListener('click', ()=>{

        //reset les highlight plateau quand nouveau click
        if(current_active){
            current_active.classList.remove('active');
            if(!div.classList.contains('possible-move')){
                document.querySelectorAll('.possible-move')
                    .forEach(div =>{div.classList.remove('possible-move')})
            }
        }

        //trouvons les coordonnées pour manipuler le plateau
        let coord = getCoordinates(div);
        let piece = plateau[coord[0]][coord[1]]

        //au clic sur une pièce
        if(piece instanceof Piece){

            // si on clique pour manger cette pièce
            if(div.classList.contains('possible-move')){
                plateau[coord[0]][coord[1]] = last_piece[0];
                plateau[last_piece[1][0]][last_piece[1][1]] = null;
                document.querySelectorAll('.possible-move')
                    .forEach(div =>{
                        div.classList.remove('possible-move');
                        div.classList.remove('EAT')
                    })
                update();
            }

            //sinon cela signifie que nous souhaitons la déplacer
            else{
                current_active = div;
                current_active.classList.add('active');

                //affichons toutes les cases possibles pour se déplacer
                pm = piece.possibleMove(coord, plateau);
                for(let i=0; i<pm.length; i++){
                    let id = Piece.toString(pm[i]);
                    document.querySelector('div.'+id).classList.add('possible-move');
                    if(plateau[pm[i][0]][pm[i][1]] instanceof Piece){
                        document.querySelector('div.'+id).classList.add('EAT');
                    }
                }
                last_piece = [piece, coord];
            }
        }
        //au clic sur une case vide
        else{

            //si cette case est correcte au déplacement, on déplace
            if(div.classList.contains('possible-move')){
                plateau[coord[0]][coord[1]] = last_piece[0];
                plateau[last_piece[1][0]][last_piece[1][1]] = null;
                document.querySelectorAll('.possible-move')
                    .forEach(div =>{
                        div.classList.remove('possible-move');
                        div.classList.remove('EAT')
                    })
                update();
            }
        }

        //dans les deux cas il nous faut vérifier si un pion s’est retrouvé sur la ligne opposée
        //faisons boucler la ligne 0 et 7 pour vérifier ce cas de façon globale

        //côté blanc
        plateau[0].forEach((cell, index_cell) =>{
            if(cell instanceof Piece && cell.type === 'pawn' && cell.color === 'black'){
                console.log('un pion noir sur la ligne : '+index_cell)
                document.querySelector('div.modal_container').style.display = 'flex';
                document.querySelector('form input[type=hidden]').value = Piece.toString([0, index_cell]);
            }
        })

        //côté noir
        plateau[7].forEach((cell, index_cell) =>{
            if(cell instanceof Piece && cell.type === 'pawn' && cell.color === 'white'){
                console.log('un pion blanc sur la ligne : '+index_cell)
                document.querySelector('div.modal_container').style.display = 'flex';
                document.querySelector('form input[type=hidden]').value = Piece.toString([7, index_cell]);
            }
        })

        //consequences du form
        document.querySelector('form button').addEventListener('click', ()=>{
            let coord = Piece.toTuple(document.querySelector('form input[type=hidden]').value);
            let color;
            let type = document.querySelector('form select').value;

            if(coord[0] === 0) color = 'black';
            else color = 'white';
            plateau[coord[0]][coord[1]] = new Piece(type, color);
            document.querySelector('div.modal_container').style.display = 'none';
            update();
        })
    })
})