// for trigger input

let imageFactory = []; // when form submit you must use this array

const options = {
    limit: 10
}

let fileInput;
let activeCropper;
let activeAspectRatio = 16 / 9;

const selectImages = (self) => {
    self.querySelector('input[type="file"]').click();
    fileInput = self.querySelector('input[type="file"]');
}

// for select images 

const fileToDataUri = (image) => {
    return new Promise((res) => {
        const reader = new FileReader();
        const { type, name, size } = image;
        reader.addEventListener('load', () => {
            res({
                base64: reader.result,
                name: name,
                type,
                size: size,
                id: uniqueId()
            })
        });
        reader.readAsDataURL(image);
    })
}

// when input change this code block will run

const getImages = async (self) => {
    if (document.querySelectorAll('.empty-box').length > 0) {
        const newImagesPromises = []
        for (let i = 0; i < self.files.length; i++) {
            newImagesPromises.push(fileToDataUri(self.files[i]))
        }
        const newImages = await Promise.all(newImagesPromises);
        imageFactory = [...newImages, ...imageFactory];
        handleGalerry(newImages);
        fileInput ? fileInput.value = null : false;
    }
}



// for show img 


const showImg = (self) => {
    let getImg = self.closest('.inner-card').querySelector('.normal-img img').src;
    if (getImg) {
        document.querySelector('.modal-box .main-img img').setAttribute('src', getImg);
        document.querySelector('.modal-box').classList.add('active');
    }
}


// close show img modal 

const closeModal = () => {
    document.querySelectorAll('.modal-box').forEach(item => {
        item.classList.remove('active');
    })
}


// this's initial tempate, this template not supporting drag or sorting 

const initialTemplate = `<div class="card-box empty-box">
    <div class="inner-card no-img">
        <div class="img-box">
            <img src="./assets/add-img.svg" alt="">
        </div>
    </div>
    </div>
`;


// if you want to change image count, you can it, you must change options
// limit, for example, i have wrote only 9 img.

window.addEventListener('load', function () {
    for (let i = 0; i < options.limit - 1; i++) {
        document.querySelector('.box-images').innerHTML += initialTemplate;
    }
});


// this template supporting drag & sorting function and also, 
// it's not a ghost template not like initialTemplate 


const createTemplate = (data) => {
    return `<div class="card-box sortable ui-state-default" id="${data['id']}">
     <div class="inner-card">
         <div class="img-box normal-img">
             <img src="${data['base64']}" alt="">
         </div>
         <div class="tools-img">
             <div class="icon view" onclick="showImg(this)">
                 <img src="./icons/view.svg" alt="">
             </div>
             <div class="icon crop" onclick="cropImg(this)">
                 <img src="./icons/crop.svg" alt="">
             </div>
             <div class="icon trash" onclick="trashImg(this)">
             <img src="./icons/trash.svg" alt="">
         </div>
         </div>
         </div>
     </div>`;
}


// this method will give you id

const uniqueId = () => {
    return Math.floor(Math.random() * 99999) + '_' + new Date().getTime();
};




const handleGalerry = (data) => {
    for (let i = 0; i < data.length; i++) {
        document.querySelector('.empty-box').remove();
        document.querySelector('.box-images .add-image').insertAdjacentHTML('afterend', createTemplate({ ...data[i], index: i }));
    }
}

const trashImg = (self) => {
    let id = self.closest('.card-box').getAttribute('id');
    imageFactory = imageFactory.filter(item => item['id'] != id);
    self.closest('.card-box').remove();
    document.querySelector('.box-images').innerHTML += initialTemplate;
}

// initial jquery UI config 

$(function () {
    $(".sortable").sortable({
        revert: true,
        opacity: 0.5,
        items: '.sortable',
        stop: function (evt, ui) {
            let index = ui.item.index() - 1;

            let itemId = ui.item.attr('id');

            let itemIndex = imageFactory.findIndex(i => i.id == itemId);

            let element = imageFactory[itemIndex];

            imageFactory.splice(itemIndex, 1);


            imageFactory.splice(index, 0, element);

        }
    });
    $('.sortable').disableSelection();
    $('.sortable').sortable({ cancel: '.add-image' });
});


// crop img function 

const cropImg = (self, aspectRatio = 16 / 9) => {
    let img = self.closest('.card-box').querySelector('.normal-img img');
    let src = $(img).attr('src');   
    let id = $(self.closest('.inner-card')).parent().attr('id');
    $('.cropper-box .img-area img').attr('src', src);
    $('.cropper-box .img-area img').attr('id', id);
    $('.cropper-box').addClass('active');
    let element = $('.cropper-box .img-area img');
    activeCropper = $(element).cropper({
        aspectRatio: aspectRatio,
        viewMode: 3,
        dragMode: 'none',
        minCanvasWidth: 200,
        minCanvasHeight: 200,
        minCropBoxWidth: 200,
        minCropBoxHeight: 200,
        responsive: true,
        zoomOnTouch: true,
        zoomable: true
    });
}


// for reSetting, when you change setting this function will be run 

const reSetting = (aspectRatio, self) => {
    activeAspectRatio = aspectRatio;
    document.querySelectorAll('.options .optionBtn').forEach(item => item.classList.remove('active'));
    $(self).addClass('active');
    let element = $('.cropper-box .img-area img');
    $('.cropper-container').fadeOut();
    $(element).cropper('destroy');
    activeCropper = $(element).cropper({
        aspectRatio: aspectRatio,
        minCanvasWidth: 200,
        minCanvasHeight: 200,   
        minCropBoxWidth: 200,
        minCropBoxHeight: 200,
        zoomable: true,
        zoomOnTouch: true,
        viewMode: 3,
        responsive: true,
        dragMode: 'none'
    });
}


const closeCropper = () => {
    document.querySelectorAll('.options .optionBtn').forEach(item => item.classList.remove('active'));
    $('.optionBtn.default').addClass('active');
    let element = $('.cropper-box .img-area img');
    $(element).cropper('destroy');
    $('.cropper-box').removeClass('active');
}


const cutImg = () => {
    let data = $(activeCropper).cropper('getCroppedCanvas');
    let base64 = data.toDataURL('image/jpeg', 1.0);
    let id =  $('.cropper-box .img-area img').attr('id');
    let getIndex = imageFactory.findIndex(i => i.id == id);
    imageFactory[getIndex]['base64'] = base64;
    $(`.card-box.sortable[id="${id}"] .normal-img img`).remove();
    let createImg = document.createElement('img');
    createImg.src = base64;
    $(`.card-box.sortable[id="${id}"] .normal-img`).append(createImg);
    closeCropper();
}