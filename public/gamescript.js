let body = document.querySelector("body");
let start = false;
let userseq = [];
let randomseq = [];
let level = 0 ;
let acptinput=false;

body.addEventListener("click",()=>{
    if(!start){
        console.log("starting the game ");
        let  starthead = document.querySelector(".startheading");
        starthead.innerText = "Game Started ";
        start = true;
        levelup();
    }
});
function flashbtn(btn,id){
    let flashcol = (id==1)?"darkred":(id==2)?"darkblue":(id==3)?"darkgreen":"darkyellow";
    btn.classList.add(flashcol);
    setTimeout(() => {
        btn.classList.remove(flashcol);
    }, 250);
}
function newflashbtn(btn,id){
    
    btn.classList.add("newflash");
    setTimeout(()=>{
        btn.classList.remove("newflash");
    },350);
}

function levelup(){
    acptinput=false;
    userseq=[];
    level++;
    let randombox = Math.floor(Math.random()*4)+1
    let btn = document.querySelector(`.b${randombox}`);
    randomseq.push(randombox);
    newflashbtn(btn);
    console.log(randomseq);
    let score = document.querySelector(".score");
    score.innerText=`level : ${level}`;
}

function checkseq(idx){
    if (userseq[idx]==randomseq[idx]) {
        if (userseq.length==randomseq.length) {
            setTimeout(levelup, 400);
        }
    }
    else{
        let score = randomseq.length-1;
        randomseq = [];
        userseq = [];
       // let starthead = document.querySelector(".startheading");
        //starthead.innerText = "Game Over click anywhere to start again  ";
        score = document.querySelector(".score");
        score.innerText=`level : ${level}`;
        window.location.href=`/game/${(level)}`;
        level = 0 ;
        start=false;
        // setTimeout(() => {
        //     start=false;
        // }, 100);
    }
}


let btns = document.querySelectorAll(".box");
for (let btn of btns){
   btn.addEventListener("click",()=>{
     if (start){ flashbtn(btn,btn.getAttribute("id"));
     //console.log(`id is ${btn.getAttribute("id")}`) ;
     userseq.push(Number(btn.getAttribute("id")));
     console.log("user seq " , userseq);
     checkseq(userseq.length-1);
     }
   });
};