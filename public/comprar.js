
emailjs.init('user_1TK27ROnqf46mrzcvKJxQ');

function sendEmail(){


    let name = document.getElementById("userName").textContent;
    let books = Array.from(document.getElementsByClassName("bookName")).map(e => e.textContent).join(", ");
    let cost = document.getElementById("totalCost").textContent;

    emailjs.send("gmail","template_r0db7sg",{
    from_name: name,
    order: books,
    total: cost,
    });

    alert("Orden realizada!");

}

var btnSubmit = document.getElementById("btnSubmit");
btnSubmit.addEventListener(
    "click",
    function(){
        sendEmail();
    }
    ,
    false
); 
