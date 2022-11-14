export class Piece
{
    constructor(type, color) {
        this.type = type;
        this.color = color;
    }

    static toTuple(a){
        //a est un string de type "a1"
        let list = a.split("");
        return [list[0].charCodeAt(0) - 97, parseInt(list[1])]
    }

    static toString(list){
        return String.fromCharCode((97 + list[0]))+list[1];
    }

    possibleMove(coord, plateau) {
        let list = [];

        //déplacement possible pion
        if(this.type === 'pawn'){

            let speed;
            if(this.color === 'white'){
                speed = 1;
            }else{
                speed = -1;
            }

            //déplacement simple

            if(!(plateau[coord[0] + speed][coord[1]] instanceof Piece)){
                list.push([coord[0] + speed, coord[1]]);
            }
            if((coord[0] === 1 && this.color === 'white') || (coord[0]=== 6 && this.color === 'black')){
                if(!(plateau[coord[0] + speed*2][coord[1]] instanceof Piece)){
                    list.push([coord[0] + (speed * 2), coord[1]]);
                }
            }

            //manger une pièce
            if(plateau[coord[0]+speed][coord[1]+speed] instanceof Piece
                && plateau[coord[0]+speed][coord[1]+speed].color !== this.color){
                list.push([coord[0]+speed,coord[1]+speed]);
            }
            if(plateau[coord[0]+speed][coord[1]-speed] instanceof Piece
                && plateau[coord[0]+speed][coord[1]-speed].color !== this.color){
                list.push([coord[0]+speed,coord[1]-speed]);
            }
        }

        //déplacements possibles pour une tour, un fou ou une reine (assez similaire)
        if(this.type === 'tower' || this.type === 'bishop' || this.type === 'queen'){
            let tab;
            if(this.type === 'tower') tab = [[1,0], [-1,0], [0,1], [0,-1]];
            else if(this.type === 'bishop') tab = [[1,1], [1,-1], [-1,1], [-1,-1]];
            //la reine est une tour folle
            else tab = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]]

            for(let i = 0; i<tab.length; i++){
                //pour chaque direction
                for(let j = 1; j<8; j++){
                    let x = coord[0] + tab[i][0]*j;
                    let y = coord[1] + tab[i][1]*j;
                    //on ne peut vérifier le type de la case si elle sort du tableau, on vérifie donc en amont
                    if(x > 7 || x < 0 || y > 7 || y < 0){
                        break;
                    }else{
                        let cell = plateau[x][y];
                        if(cell instanceof Piece){
                            if(cell.color !== this.color){
                                list.push([x, y]);
                            }
                            break;
                        }else{
                            list.push([x, y]);
                        }
                    }
                }
            }
        }

        if(this.type === 'king' || this.type === 'knight'){
            let tab
            if(this.type === 'king') tab = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]];
            else tab = [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]];
            tab.forEach(c =>{
                {
                    let x = coord[0] + c[0]
                    let y = coord[1] + c[1]
                    if(x > 7 || x < 0 || y > 7 || y < 0){
                        return;
                    }else{
                        let cell = plateau[x][y];
                        if(cell instanceof Piece){
                            if(cell.color !== this.color){
                                list.push([x, y]);
                            }
                        }else{
                            list.push([x, y]);
                        }
                    }
                }
            })
        }

        //verification finale du tableau
        for(let i = 0; i<list.length; i++){
            if(list[i][0] >= plateau.length || list[i][0] < 0 || list[i][1] < 0 || list[i][1] >= plateau.length){
                list.splice(i, 1);
                //on réduit le tableau il faut donc repasser l’index
                i--;
            }
        }

        return list
    }

    isCheck(coord, plateau){
        let x = coord[0];
        let y = coord[1];

        //par rapport à un pion
        let speed;
        let aPawnChecks = false;
        if(this.color === 'white'){
            speed = 1;
        }else{
            speed = -1;
        }
        [plateau[x+1*speed][y+1], plateau[x+1*speed][y-1]].forEach(cell =>{
            if(cell instanceof Piece){
                if((cell.type === 'pawn' && cell.color !== this.color)){
                    console.log('pion met en échec')
                    aPawnChecks = true;
                }
            }
        })
        if(aPawnChecks){
            //console.log('pawn');
            return true;
        }

        //par rapport à une tour (ou reine)

        let lineChecks = false;
        let tab = [[1,0], [-1,0], [0,1], [0,-1]];
        tab.forEach(dir => {
            for(let i=1; i < 7; i++){
                if(x + i*dir[0] < 8 && x + i*dir[0] >= 0 && y + i*dir[1] < 8 && y + i*dir[1] >= 0){
                    let cell = plateau[x+ i*dir[0]][y + i*dir[1]];
                    if(cell instanceof Piece){
                        //si on rencontre une pièce amie on break
                        if(cell.color === this.color){
                            break;
                        }else{
                            if(cell.type === 'queen' || cell.type === 'tower'){
                                lineChecks = true;
                                break;
                            }
                        }
                    }
                }
            }
        });

        if(lineChecks){
            //console.log('line')
            return true;
        }

        //par rapport à un fou (ou reine)

        let diagCheck = false;
        tab = [[1,1], [1,-1], [-1,1], [-1,-1]];
        tab.forEach(dir => {
            for(let i=1; i < 7; i++){
                if(x + i*dir[0] < 8 && x + i*dir[0] >= 0 && y + i*dir[1] < 8 && y + i*dir[1] >= 0){
                    let cell = plateau[x+ i*dir[0]][y + i*dir[1]];
                    if(cell instanceof Piece){
                        //si on rencontre une pièce amie on break
                        if(cell.color === this.color){
                            break;
                        }else{
                            if(cell.type === 'queen' || cell.type === 'bishop'){
                                diagCheck = true;
                                break;
                            }
                        }
                    }
                }
            }
        });

        if(diagCheck){
            //console.log('diag')
            return true;
        }


        //finalement pour un cavalier

        let aKnightCheck = false;

        tab = [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]];

        tab.forEach(dir => {
            let i = x + dir[0];
            let j = y + dir[1];
            if( i < 8 && i >= 0 && j < 8 && j >= 0){
                let cell = plateau[i][j];
                if(cell instanceof Piece){
                    if(cell.type === 'knight' && cell.color !== this.color){
                        aKnightCheck = true;
                    }
                }
            }
        });

        if(aKnightCheck){
            //console.log('knight')
            return true;
        }


        return false;
    }
}
