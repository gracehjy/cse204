// elements
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
const submitBtn = document.querySelector("#submit");
const rec = document.querySelector("#rec");
const food = document.querySelector("#food");
const spot = document.querySelector("#spot");

// image slideshow logic
let slideIndex = 1;
showImages(slideIndex);

nextBtn.addEventListener('click', () => {
    slideIndex += 1
    showImages(slideIndex)
})

prevBtn.addEventListener('click', () => {
    slideIndex -= 1
    showImages(slideIndex)
})

// form submit logic
submitBtn.addEventListener('click', () => {
    if (rec.value.trim() !== "" && (food.checked || spot.checked)) {
        alert("Recommendation submitted. Thank you!");
    }
})

function showImages(n) {
    let slides = document.getElementsByClassName("myImages");
  
    if (n > slides.length) {
        slideIndex = 1;
    }

    if (n < 1) {
        slideIndex = slides.length 
    }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slides[slideIndex - 1].style.display = "block";
}