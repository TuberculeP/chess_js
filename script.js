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

const icon = {
    'tower': '♜',
    'pawn': '♟',
    'knight': '♞',
    'bishop': '♝',
    'queen': '♛',
    'king': '♚',
}

let check_text  = document.querySelector('h3 span#check');
function update(){
    document.querySelectorAll('main>div').forEach((row, i) => {
        row.querySelectorAll('div').forEach((cell, j) => {
            cell.classList.remove('white');
            if(plateau[i][j] instanceof Piece){
                //ajouter l'émoji
                cell.innerHTML = icon[plateau[i][j].type];
                if(plateau[i][j].color === 'white'){
                    cell.classList.add('white');
                }
            }else{
                cell.innerHTML = "";
            }
        })
    })
    check_text.innerHTML = '';
    document.querySelectorAll('.check').forEach(cell => {
        cell.classList.remove('check');
    })

    //Est-ce qu’un roi est en échec
    //commençons par trouver tous les rois
    for(let line = 0; line<plateau.length; line++){
        for(let cell = 0; cell<plateau[line].length; cell++){
            if(plateau[line][cell] instanceof Piece && plateau[line][cell].type === 'king'){
                let king = plateau[line][cell];
                if(king.isCheck([line, cell], plateau)) {
                    let id = Piece.toString([line, cell]);
                    document.querySelector('.'+id).classList.add('check');
                    if(king.color === 'white'){
                        check_text.innerHTML += '[Roi Blanc en échec] ';

                    }else{
                        check_text.innerHTML += '[Roi Noir en échec] ';
                    }
                }
            }
        }
    }
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

//tours de jeu

let currentPlayer = 'white';
const H3Playing = document.querySelector('h3 span#player');

//variables utiles hors boucle pour sauvegarder des trucs
let current_active;
let pm = [];
let last_piece = [];

function move(coord){
    plateau[coord[0]][coord[1]] = last_piece[0];
    plateau[last_piece[1][0]][last_piece[1][1]] = null;
    document.querySelectorAll('.possible-move')
        .forEach(div =>{
            div.classList.remove('possible-move');
            div.classList.remove('EAT')
        })

    if(currentPlayer === 'white'){
        currentPlayer = 'black';
        H3Playing.innerHTML = 'noirs';
    }else{
        currentPlayer = 'white';
        H3Playing.innerHTML = 'blancs';
    }
    update();

}

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
                move(coord);
            }

            //sinon cela signifie que nous souhaitons la déplacer
            else{
                //si ce sont nos pions
                if(currentPlayer === piece.color){
                    current_active = div;
                    current_active.classList.add('active');

                    //affichons toutes les cases possibles pour se déplacer
                    pm = piece.possibleMove(coord, plateau);
                    for(let i=0; i<pm.length; i++){
                        let id = Piece.toString(pm[i]);
                        document.querySelector('div.'+id).classList.add('possible-move');
                        if(plateau[pm[i][0]][pm[i][1]] instanceof Piece){
                            if(plateau[pm[i][0]][pm[i][1]].type !== 'king'){
                                document.querySelector('div.'+id).classList.add('EAT');
                            }else{
                                document.querySelector('div.'+id).classList.remove('possible-move');
                            }
                        }
                    }
                    last_piece = [piece, coord];
                }
            }
        }
        //au clic sur une case vide
        else{

            //si cette case est correcte au déplacement, on déplace
            if(div.classList.contains('possible-move')){
                move(coord);
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

