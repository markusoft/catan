/* 
 * =============================================================================
 * Author: Mark Angelo Angulo
 * =============================================================================
 */

document.addEventListener('DOMContentLoaded', function (){

    Catan = (function() {
        
        const imgExtension = '.webp';
        const moduleResources = './';
        
        /* 
         * ---------------------------------------------------------------------
         * Private Members
         * ---------------------------------------------------------------------
         */
        
        const maps = data['maps'];
        let savedMaps = {};

        let currentMap = {};
        let chitModal, harborModal, saveModal;
        let flippedTiles = [], flippedNumbers = [], flippedHarbors = [];

        let dragging = null;
        
        let init = function() {
            parallax();
            initModals();
            loadSavedMaps();
            filters();
            dragAndDropTiles();
            generateRandom();
            shuffle();
            saveImage();
            flip();
            saveMap();
            deleteMap();
        };
        
        let parallax = function() {
            Lazy.parallax('.tpl-parallax');
        };
        
        let loadSavedMaps = function() {
            if (typeof Storage !== 'undefined') {
                savedMaps = localStorage.getObject('maps') || {};
                if( Object.keys(savedMaps).length ) {
                    let frame = document.querySelector('select[name="frame"]');
                    let option = document.createElement('option');
                    option.value = 'saved-maps';
                    option.innerText = 'Saved Maps';
                    frame.append(option);
                }
            }
        };
        
        let initModals = function() {
            
            chitModal = Lazy.modal({
                closable: false,
                closeButton: false,
                title: 'Add Chit',
                bodyStyles: {
                    padding: '1rem'
                },
                content: `<div>
                            <label><input type="radio" name="location" value="top-right" /> <span>top</span></label><br />
                            <label><input type="radio" name="location" value="top-left" /> <span>top left</span></label><br />
                            <label><input type="radio" name="location" value="right" /> <span>top right</span></label><br />
                            <label><input type="radio" name="location" value="center" checked="checked" /> <span>center</span></label><br />
                            <label><input type="radio" name="location" value="bottom-left" /> <span>bottom</span></label><br />
                            <label><input type="radio" name="location" value="left" /> <span>bottom left</span></label><br />
                            <label><input type="radio" name="location" value="bottom-right" /> <span>bottom right</span></label>
                        </div>`,
                footer: 'cancel',
                onCancel: function(){
                    this.close();
                }
            });
            
            harborModal = Lazy.modal({
                closable: false,
                closeButton: false,
                title: 'Add Harbor',
                bodyStyles: {
                    padding: '1rem'
                },
                content: `<div>
                            <label><input type="radio" name="location" value="top-right" checked="checked" /> <span>top</span></label><br />
                            <label><input type="radio" name="location" value="top-left" /> <span>top left</span></label><br />
                            <label><input type="radio" name="location" value="right" /> <span>top right</span></label><br />
                            <label><input type="radio" name="location" value="bottom-left" /> <span>bottom</span></label><br />
                            <label><input type="radio" name="location" value="left" /> <span>bottom left</span></label><br />
                            <label><input type="radio" name="location" value="bottom-right" /> <span>bottom right</span></label>
                        </div>`,
                footer: 'cancel',
                onCancel: function(){
                    this.close();
                }
            });
            
            saveModal = Lazy.modal({
                closable: false,
                closeButton: false,
                title: 'Map Name',
                bodyStyles: {
                    padding: '1rem'
                },
                content: `<div>
                            <input type="text" id="map-name" class="lzy-input" value="New Map" />
                        </div>`,
                footer: 'cancel',
                onCancel: function(){
                    this.close();
                }
            });
        };
        
        let flip = function() {
            
            Lazy.don('dblclick', '.numbered-tile', function(e){
                
                let numbers = ['2', '3', '4', '5', '6', '8', '9', '10', '11', '12'];
                let tiles = ['wood-1', 'wood-2', 'wood-3', 'wood-4', 'clay-1', 'clay-2', 'clay-3', 'clay-1', 'sheep-1', 'sheep-2', 'sheep-3', 'sheep-4', 'wheat-1', 'wheat-2', 'wheat-3', 'wheat-4', 'ore-1', 'ore-2', 'ore-3', 'ore-1', 'gold', 'gold-2', 'gold', 'gold-2', 'water', 'water', 'water', 'water', 'dessert', 'dessert', 'dessert', 'dessert'];
                
                let tile = e.target.querySelector('img.tile');
                let number = e.target.querySelector('img.number.flipped');
                
                if(tile) {
                    let src = tile.src;
                    if( src.includes('flipped') ) {

                        e.target.animate({
                            transform: ['rotateY(0deg)', 'rotateY(180deg)']
                        },{ 
                            duration: 400,
                            iterations: 1,
                            easing: "ease-in-out"
                        }).onfinish = function(e) {
                            
                            let newTile = tiles.random();
                            if( flippedTiles.length ) {
                                newTile = flippedTiles.shift();
                            }
                            tile.src = moduleResources + 'img/tiles/' + newTile + imgExtension;
                            
                            if(number) {
                                let newNumber = numbers.random();
                                if( flippedNumbers.length ) {
                                    newNumber = flippedNumbers.shift();
                                }
                                number.src = moduleResources + 'img/numbers/' + newNumber + imgExtension;
                            }
                        };
                    }
                }
            });
            
            Lazy.don('dblclick', '.numbered-tile .harbor.flipped', function(e){
                
                let harbor = e.target;
                let harbors =  ['3-1', '2-1-wheat', '2-1-wood', '2-1-ore', '2-1-clay', '2-1-sheep'];
                e.target.animate({
                    transform: ['rotateY(0deg)', 'rotateY(180deg)']
                },{ 
                    duration: 400,
                    iterations: 1,
                    easing: "ease-in-out"
                }).onfinish = function(e) {
                    let newHarbor = harbors.random();
                    if( flippedHarbors.length ) {
                        newHarbor = flippedHarbors.shift();
                    }

                    harbor.classList.remove('flipped');
                    harbor.src = moduleResources + 'img/harbors/' + newHarbor + imgExtension;
                };
                
            });
            
        };

        let saveImage = function() {
            Lazy.on('click', '#save-image', e => {
                
                Lazy.loader({
                    message: 'Saving Image ...'
                });
                
                let frame = document.querySelector('select[name="frame"]');
                let predefined = document.querySelector('select[name="predefined"]');
                let title = predefined.selectedOptions[0].text;
                let map = data['maps'][frame.value][predefined.value];
                let mapContainer = document.querySelector('#map');
                let frameUsed = map['frame'];
                
                let sizes = {
                    'catan': {
                        width: '1512',
                        height: '1315'
                    },
                    'seafarers-small': {
                        width: '1713',
                        height: '1723'
                    },
                    'seafarers-medium': {
                        width: '1717',
                        height: '1962'
                    },
                    'seafarers-large': {
                        width: '1719',
                        height: '2175'
                    }
                };
                
                let width = getComputedStyle(mapContainer).width;
                let height = getComputedStyle(mapContainer).height;
                let frameSize = sizes[frameUsed];
                mapContainer.classList.add('print');
                mapContainer.style.width = frameSize['width'] + 'px';
                mapContainer.style.height = frameSize['height'] + 'px';
                
                html2canvas(document.querySelector('#map'),{
                    backgroundColor: null
                }).then(function(canvas) {
                    var a = document.createElement('a');
                    a.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                    a.download = title + '.png';
                    a.click();
                    
                    Lazy.unblock();
                });
                
                mapContainer.classList.remove('print');
                mapContainer.style.width = width;
                mapContainer.style.height = height;
                
            });
        };
        
        let generateRandom = function() {
            Lazy.on('click', '#random', e => {
                e.preventDefault();
                
                let frame = document.querySelector('select[name="frame"]');
                let predefined = document.querySelector('select[name="predefined"]');
                let map = data['maps'][frame.value][predefined.value];
                
                let layout = map['layout'];
                let tileNumbers = map['numbers'];
                let tileNames = map['tiles'];
                let harbors = map['harbors'];
                let harborLocations = map['harborLocations'];

                // shuffle
                tileNumbers = tileNumbers
                    .map(value => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value);

                tileNames = tileNames
                    .map(value => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value);
            
                harbors = harbors
                    .map(value => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value);

//                generateBoard(layout, tileNames, tileNumbers, harbors, harborLocations);
                generateBoard(layout, tileNames, tileNumbers);

            });
        };
        
        let shuffle = function() {
            Lazy.on('click', '#shuffle', e => {
                e.preventDefault();
                
                let frame = document.querySelector('select[name="frame"]');
                let predefined = document.querySelector('select[name="predefined"]');
                let map = data['maps'][frame.value][predefined.value];
                
                let layout = map['layout'];
                let tileNumbers = map['numbers'];
                let tileNames = map['tiles'];
                let harbors = map['harbors'];
                let harborLocations = map['harborLocations'];
                
                let leftTiles = [];
                let fixedTiles = [];
                tileNames.forEach(function(value, idx) {
                    if(value === 'water' || value === 'dessert' || value === 'gold' || value === 'flipped') {
                        fixedTiles[idx] = value;
                    } else {
                        leftTiles.push(value);
                    }
                });
                
                // shuffle tiles
                leftTiles = leftTiles
                    .map(value => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value);
                
                // return water and dessert
                fixedTiles.forEach(function(value, idx) {
                    leftTiles.splice(idx, 0, value);
                });
                
                
                let leftNumbers = [];
                let fixedNumbers = [];
                tileNumbers.forEach(function(value, idx) {
                    if(value === 'none' || value === 'flipped') {
                        fixedNumbers[idx] = value;
                    } else {
                        leftNumbers.push(value);
                    }
                });
                
                // shuffle numbers
                leftNumbers = leftNumbers
                    .map(value => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value);
                
                // return flipped numbers
                fixedNumbers.forEach(function(value, idx) {
                    leftNumbers.splice(idx, 0, value);
                });

                // shuffle
//                tileNumbers = tileNumbers
//                    .map(value => ({ value, sort: Math.random() }))
//                    .sort((a, b) => a.sort - b.sort)
//                    .map(({ value }) => value);
            
                harbors = harbors
                    .map(value => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value);

                generateBoard(layout, leftTiles, leftNumbers, harbors, harborLocations);

            });
        };
        
        let filters = function() {
            
            Lazy.on('change', 'select[name="frame"]', e => {
                e.preventDefault();

                let value = e.target.value;
                let predefined = document.querySelector('select[name="predefined"]');
                predefined.innerHTML = '<option value="" selected="selected" disabled="disabled">-- Select Predefined --</option>';
                
                if( value === 'saved-maps' ) {
                    for(var key in savedMaps ) {
                        let option = document.createElement('option');
                        option.value = key;
                        option.innerText = savedMaps[key]['title'];
                        predefined.append(option);
                    }
                    predefined.value = Object.keys(savedMaps)[0];
                } else {
                    for(var key in maps[value] ) {
                        let option = document.createElement('option');
                        option.value = key;
                        option.innerText = maps[value][key]['title'];
                        predefined.append(option);
                    }
                    predefined.value = value === 'catan' ? 'one' : 'fair';
                }

                predefined.dispatchEvent(new Event('change'));
                
                let map = document.querySelector('#map');
                map.style.width = '100%';
                map.style.height = 'auto';
                
            });
            
            Lazy.on('change', 'select[name="predefined"]', e => {
                
                document.querySelector('#shuffle').disabled = false;
                document.querySelector('#random').disabled = false;
                document.querySelector('#save-map').disabled = false;
                document.querySelector('#save-image').disabled = false;
                
                let value = e.target.value;
                let frame = document.querySelector('select[name="frame"]');
                
                let map = {};
                if( frame.value === 'saved-maps' ) {
                    map = savedMaps[value];
                    document.querySelector('#delete-map').disabled = false;
                } else {
                    map = data['maps'][frame.value][value];
                }
                currentMap = map;
                
                let mapContainer = document.querySelector('#map');
                mapContainer.className = map['frame'];
                mapContainer.style.width = '100%';
                mapContainer.style.height = 'auto';
                
                let frameImage = document.querySelector('#frame');
                frameImage.src = moduleResources + 'img/scenarios/' + map['frame'] + imgExtension;
                
                flippedTiles = map['flippedTiles'] || [];
                flippedNumbers = map['flippedNumbers'] || [];
                flippedHarbors = map['flippedHarbors'] || [];
                
                generateBoard(map['layout'], map['tiles'],  map['numbers'], map['harbors'], map['harborLocations'], map['chits']);
            });
            
            document.querySelector('select[name="frame"]').value = '';
            document.querySelector('select[name="predefined"]').value = '';
            
            let frame = document.querySelector('select[name="frame"]');
            frame.value = 'catan';
            frame.dispatchEvent(new Event('change'));
        };
        
        let dropOrClick = function(e) {

            let drop = e.target.closest('.numbered-tile');
            if( drop && dragging && dragging.classList.contains('tile') ) {
                drop.querySelector('img.tile').src = dragging.src;
            }

            if( drop && dragging && dragging.classList.contains('number') ) {
                let tileNumber = drop.querySelector('img.number');
                if( tileNumber ) {
                    tileNumber.classList = dragging.classList;
                    tileNumber.src = dragging.src;
                } else {
                    let number = document.createElement('img');
//                    number.className = 'number';
                    number.classList = dragging.classList;
                    number.src = dragging.src;
                    drop.prepend(number);
                }
            }

            if( drop && dragging && dragging.classList.contains('chit') ) {
                let src = dragging.src;
                chitModal.onOk = function(){
                    let location = document.querySelector('input[name="location"]:checked');
                    if(location) {
                        let chit = document.createElement('img');
                        chit.className = 'chit';
                        chit.classList.add(location.value);
                        chit.src = src;
                        drop.append(chit);
                    }
                    this.close();
                };
                chitModal.open();
            }

            if( drop && dragging && dragging.classList.contains('harbor') ) {
                let src = dragging.src;
                let flipped = dragging.classList.contains('flipped');
                
                if( e.target.classList.contains('harbor') ) {
                    e.target.classList.remove('flipped');
                    if( flipped ) { e.target.classList.add('flipped');}
                    e.target.src = src;
                } else {
                    harborModal.onOk = function(){
                        let location = document.querySelector('input[name="location"]:checked');
                        if(location) {
                            let harbor = document.createElement('img');
                            harbor.className = 'harbor';
                            harbor.classList.add(location.value);
                            if( flipped ) { harbor.classList.add('flipped');}
                            harbor.src = src;
                            drop.append(harbor);
                        }
                        this.close();
                    };
                    harborModal.open();
                }
            }
        };
        
        let dragAndDropTiles = function() {
            
            Lazy.don('click', '#numbers img, #harbors img, #tiles img, #trash img', e => {
                let selected = e.target;
                selected.classList.toggle('active');
                if( selected.classList.contains('active') ) {
                    [].forEach.call(document.querySelector('#map-generator').querySelectorAll('.active'), (active) => {
                        active.classList.remove('active');
                    });
                    selected.classList.add('active');
                    dragging = selected;
                } else {
                    dragging = null;
                }
            });
            
            Lazy.don('dragstart', '#tiles img, #numbers img, #harbors img, #map-container img', function(e) {
                dragging = e.target;
                [].forEach.call(document.querySelector('#map-generator').querySelectorAll('.active'), (active) => {
                    active.classList.remove('active');
                });
            });
            Lazy.don('dragend', '#tiles img, #numbers img, #harbors img, #map-container img', function(e) {
                dragging = null;
            });
            
            // touchmove
            Lazy.on('dragover', '#map-container .numbered-tile, #trashcan', function(e) {
                // prevent default to allow drop
                e.preventDefault();
            });
            
            document.addEventListener('click', dropOrClick);
            document.addEventListener('drop', dropOrClick);
            
            // delete items
            document.addEventListener('click', function(e){
                let drop = e.target.closest('.numbered-tile');
                if( drop && dragging && dragging.classList.contains('trash') ) {
                    if( e.target.classList.contains('harbor') || 
                        e.target.classList.contains('number') || 
                        e.target.classList.contains('chit')
                    ){
                        e.target.remove();
                    }
                }
            });
            
            Lazy.don('drop', '#trashcan', function(e){
                let drop = dragging.closest('.numbered-tile');
                if( drop && dragging ) {
                    if( dragging.classList.contains('harbor') || 
                        dragging.classList.contains('number') || 
                        dragging.classList.contains('chit')
                    ){
                        dragging.remove();
                    }
                }
            });
        };
        
        let generateBoard = function(layout, tileNames, tileNumbers, harbors = [], harborLocations = {}, chits = {}) {
            
            let map = document.querySelector('#map-container');
            map.innerHTML = '';
            
            harbors = harbors.slice();
            
            let tileCounter = 0;
            let numberCounter = -1;
            for(let l=0; l<layout.length; l++)
            {
                let div = document.createElement('div');
                
                for(let i=0; i<layout[l]; i++ )
                {
                    let numberedTile = document.createElement('div');
                    numberedTile.className = 'numbered-tile';
                    
                    // create tile
                    let tiles = document.querySelector('#numbered-tiles');
                    let img = document.createElement('img');
                    img.className = 'tile';
                    img.setAttribute('alt', 'tile');
                    img.setAttribute('src', moduleResources + 'img/tiles/' + tileNames[tileCounter] + imgExtension);
                    numberedTile.append(img);
                    if( tileNames[tileCounter] !== 'dessert' && tileNames[tileCounter] !== 'water') {
                        numberCounter++;
                    }
                    
                    // create number
                    img = document.createElement('img');
                    img.className = 'number';
                    if( tileNumbers[numberCounter] === 'flipped' ) { img.classList.add('flipped');}
                    img.setAttribute('alt', 'number');
                    img.setAttribute('src', moduleResources + 'img/numbers/' + tileNumbers[numberCounter] + imgExtension);
                    if( tileNames[tileCounter] !== 'dessert' && tileNames[tileCounter] !== 'water') {
                        numberedTile.append(img);
                    }
                    tileCounter++;
                    
                    // create harbors
                    if( harborLocations[l] && harborLocations[l][i] ) {
                        
                        let harborLocation = harborLocations[l][i];
                        if(typeof harborLocation === 'string') {
                            harborLocation = [harborLocation];
                        }
                        if( Array.isArray(harborLocation) ) {
                            [].forEach.call(harborLocation, hl => {
                                let newHarbor = harbors.shift();
                                img = document.createElement('img');
                                img.className = 'harbor';
                                img.classList.add(hl);
                                if( newHarbor === 'flipped' ){ img.classList.add('flipped'); }
                                img.setAttribute('alt', 'harbor');
                                img.setAttribute('src', moduleResources + 'img/harbors/' + newHarbor + imgExtension);
                                numberedTile.append(img);
                            });
                        }
                    }
                    
                    // chits
                    if( chits[l] && chits[l][i] ) {
                        
                        let chit = chits[l][i];
                        if(typeof chit === 'string') {
                            chit = [chit];
                        }
                        if( Array.isArray(chit) ) {
                            [].forEach.call(chit, c => {
                                img = document.createElement('img');
                                img.className = 'chit';
                                img.classList.add(c);
                                img.setAttribute('alt', 'Chit');
                                img.setAttribute('src', moduleResources + 'img/numbers/chit' + imgExtension);
                                numberedTile.append(img);
                            });
                        }
                    }
                    
                    div.append(numberedTile);
                }
                map.append(div);
            }
            
            // touchmove
            Lazy.on('dragover', '#map-container .numbered-tile', function(e) {
                // prevent default to allow drop
                e.preventDefault();
            });
            
            // animate a bit
            let numberedTiles = map.querySelectorAll('.numbered-tile');
            numberedTiles.forEach((child, idx) => {
                child.style.opacity = 0;
                let timer = idx * 20;
                setTimeout(function(){
                    child.animate({
                        opacity: [0, 1],
                        transform: ['translateY(2rem)', 'translateY(0rem)']
                    },{ duration: 400, iterations: 1, easing: "ease-out" });
                    child.style.opacity = 1;
                }, timer);
            });
            
        };
        
        let deleteMap = function() {
            
            Lazy.don('click', '#delete-map', function(e){
                
                Lazy.modal({
                    title: 'Delete Map',
                    closable: false,
                    closeButton: false,
                    content: 'Are you sure you want to delete this map',
                    footer: 'cancel',
                    bodyStyles: {
                        padding: '1rem'
                    },
                    onOk: function(){
                        
                        let predefined = document.querySelector('select[name="predefined"]');
                        let idx = predefined.value;
                        
                        delete savedMaps[idx];
                        localStorage.setObject('maps', savedMaps);
                        
                        let frame = document.querySelector('select[name="frame"]');
                        frame.value = 'catan';
                        frame.dispatchEvent(new Event('change'));
                        
                        if( ! Object.keys(savedMaps).length ) {
                            frame.querySelector('option[value="saved-maps"]').remove();
                        }
                        
                        this.close();
                    },
                    onCancel: function() {
                        this.close();
                    }
                }).open();
                
            });
            
        };
        
        let saveMap = function() {
            
            Lazy.don('click', '#save-map', function(e){
                
                let x = new Date();
                let idx = x.getFullYear() +''+ (x.getMonth() + 1) +''+ x.getDate() +''+ x.getHours() +''+ x.getMinutes() +''+ x.getSeconds();
                let extensionLength = imgExtension.length;
                
                // tiles
                let tiles = document.querySelectorAll('#map-container .tile');
                let tileNames = [];
                [].forEach.call(tiles, function(tile) {
                    tileNames.push(tile.src.substring(tile.src.lastIndexOf('/') + 1).slice(0, -extensionLength));
                });
                
                // numbers
                let numbers = document.querySelectorAll('#map-container .number');
                let numberList = [];
                [].forEach.call(numbers, function(number) {
                    numberList.push(number.src.substring(number.src.lastIndexOf('/') + 1).slice(0, -extensionLength));
                });
                
                // harbors
                let harbors = document.querySelectorAll('#map-container .harbor');
                let harborNames = [];
                let harborLocations = {};
                [].forEach.call(harbors, function(harbor) {
                    harborNames.push(harbor.src.substring(harbor.src.lastIndexOf('/') + 1).slice(0, -extensionLength));
                    
                    let numberedTile = harbor.closest('.numbered-tile');
                    let parentDiv = numberedTile.parentNode;
                    let grandParentDiv = parentDiv.parentNode;
                    let childDivs = Array.from(parentDiv.querySelectorAll(':scope > .numbered-tile'));
                    let parentDivs = Array.from(grandParentDiv.querySelectorAll(':scope > div'));
                    let secondIndex = childDivs.indexOf(numberedTile);
                    let firstIndex = parentDivs.indexOf(parentDiv);
                    let location = Array.from(harbor.classList)[1];

                    if( !harborLocations[firstIndex] ) {
                        harborLocations[firstIndex] = {};
                    }
                    if( harborLocations[firstIndex][secondIndex] ) {
                        if( typeof harborLocations[firstIndex][secondIndex] === 'string' ) {
                            harborLocations[firstIndex][secondIndex] = [harborLocations[firstIndex][secondIndex]];
                        }
                        if( Array.isArray(harborLocations[firstIndex][secondIndex]) ) {
                            harborLocations[firstIndex][secondIndex].push(location);
                        }
                    } else {
                        harborLocations[firstIndex][secondIndex] = location;
                    }
                });
                
                // chits
                let chits = document.querySelectorAll('#map-container .chit');
                let chitLocations = [];
                [].forEach.call(chits, function(chit) {
                    
                    let numberedTile = chit.closest('.numbered-tile');
                    let parentDiv = numberedTile.parentNode;
                    let grandParentDiv = parentDiv.parentNode;
                    let childDivs = Array.from(parentDiv.querySelectorAll(':scope > .numbered-tile'));
                    let parentDivs = Array.from(grandParentDiv.querySelectorAll(':scope > div'));
                    let secondIndex = childDivs.indexOf(numberedTile);
                    let firstIndex = parentDivs.indexOf(parentDiv);
                    let location = Array.from(chit.classList)[1];

                    if( !chitLocations[firstIndex] ) {
                        chitLocations[firstIndex] = {};
                    }
                    if( chitLocations[firstIndex][secondIndex] ) {
                        if( typeof chitLocations[firstIndex][secondIndex] === 'string' ) {
                            chitLocations[firstIndex][secondIndex] = [chitLocations[firstIndex][secondIndex]];
                        }
                        if( Array.isArray(chitLocations[firstIndex][secondIndex]) ) {
                            chitLocations[firstIndex][secondIndex].push(location);
                        }
                    } else {
                        chitLocations[firstIndex][secondIndex] = location;
                    }
                });
                
                let newMap = Object.assign({}, currentMap);
                newMap['tiles'] = tileNames;
                newMap['numbers'] = numberList;
                newMap['harbors'] = harborNames;
                newMap['harborLocations'] = harborLocations;
                newMap['chits'] = chitLocations;
                
                saveModal.onOk = function(){
                    let mapName = document.querySelector('#map-name');
                    if( mapName.value ) {
                        
                        newMap['title'] = mapName.value;
                        savedMaps[idx] = newMap;
                        
                        if (typeof Storage !== 'undefined') {
                            localStorage.setObject('maps', savedMaps);
                        } else {
                            Lazy.modal({
                                closable: false,
                                closeButton: false,
                                title: 'Not Supported',
                                content: 'Your device doesnt support saving',
                                footer: 'ok',
                                bodyStyles: {
                                    padding: '1rem'
                                },
                                onOk: function(){
                                    this.close();
                                }
                            }).open();
                        }
                        
                        let frame = document.querySelector('select[name="frame"]');
                        let saved = frame.querySelector('option[value="saved-maps"]');
                        if( ! saved ) {
                            let option = document.createElement('option');
                            option.value = 'saved-maps';
                            option.innerText = 'Saved Maps';
                            frame.append(option);
                        }
                        
                    } else {
                        Lazy.modal({
                            closable: false,
                            closeButton: false,
                            title: 'Save Failed',
                            content: 'Unable to save untitled map',
                            footer: 'ok',
                            bodyStyles: {
                                padding: '1rem'
                            },
                            onOk: function(){
                                this.close();
                            }
                        }).open();
                    }
                    this.close();
                };
                
                saveModal.open();
            });
            
        };
        
        init();
        
        /* 
         * ---------------------------------------------------------------------
         * Public Members
         * ---------------------------------------------------------------------
         */

        return {
            publicFunction: () => publicFunction(),
            saveImage: () => saveImage()
        };
        
    }());
    
});