
emailjs.init('user_1TK27ROnqf46mrzcvKJxQ');

function sendEmail(){


    let name = document.getElementById("userName").textContent;
    let books = document.getElementById("bookName").textContent;
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
