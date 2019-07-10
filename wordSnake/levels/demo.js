function getDemoLevel() {
    let snake = new Snake([
      new Block(new Vector(1, 1), 'G'),
      new Block(new Vector(2, 1), 'R'),
      new Block(new Vector(3, 1), 'E'),
      new Block(new Vector(4, 1), 'E'),
      new Block(new Vector(5, 1), 'N'),
    ], 'green');
    
    let wordRed = new Word(
      [new Block(new Vector(10, 15), 'R'),
       new Block(new Vector(11, 15), 'E'),
       new Block(new Vector(12, 15), 'D')],
      [1],
      'red'
    );
    
    let wordNavy = new Word(
      [new Block(new Vector(8, 9), 'N'),
       new Block(new Vector(8, 10), 'A'),
       new Block(new Vector(8, 11), 'V'),
       new Block(new Vector(8, 12), 'Y')],
      [3],
      '#001f3f'
    );
    
    let wordBlack = new Word(
      [new Block(new Vector(5, 11), 'B'),
       new Block(new Vector(5, 12), 'L'),
       new Block(new Vector(5, 13), 'A'),
       new Block(new Vector(5, 14), 'C'),
       new Block(new Vector(6, 14), 'K')    
      ], [1, 2], 'black');
    
    let wordYellow = new Word(
      [new Block(new Vector(5, 10), 'Y'),
       new Block(new Vector(6, 10), 'E'),
       new Block(new Vector(7, 10), 'L'),
       new Block(new Vector(7, 11), 'L'),
       new Block(new Vector(7, 12), 'O'),
       new Block(new Vector(6, 12), 'W')],
      [1],
      'yellow'
    );
    
    let wordBlue = new Word(
      [new Block(new Vector(20, 2), 'B'),
       new Block(new Vector(21, 2), 'L'),
       new Block(new Vector(22, 2), 'U'),
       new Block(new Vector(23, 2), 'E')],
      [0],
      'blue'  
    );
    
    let wordUltraviolet = new Word(
      [new Block(new Vector(18, 6), 'U'),
       new Block(new Vector(18, 5), 'L'),
       new Block(new Vector(18, 4), 'T'),
       new Block(new Vector(19, 4), 'R'),
       new Block(new Vector(20, 4), 'A'),
       new Block(new Vector(20, 5), 'V'),
       new Block(new Vector(20, 6), 'I'),
       new Block(new Vector(21, 6), 'O'),
       new Block(new Vector(22, 6), 'L'),
       new Block(new Vector(22, 5), 'E'),
       new Block(new Vector(22, 4), 'T')],
      [0, 4],
      '#7f1ae5'
    ); 
  
    let borderUltraviolet = new Border('#7f1ae5', [new Vector(0, 20), new Vector(24, 20)]);
    let borderPink = new Border('pink', [new Vector(0, 0), new Vector(24, 0), new Vector(24, 24), new Vector(0, 24), new Vector(0, 0)]);
    
    let borders = [borderUltraviolet, borderPink];
    let words = [wordRed, wordYellow, wordNavy, wordBlack, wordBlue, wordUltraviolet];
  
    return {
      borders,
      words,
      snake
    }
  }