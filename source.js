function AdminProducts() {
    const productname = $("#productname").val().trim();
    const productprice = $("#productprice").val().trim();
    const productpromotion = $("#promotion").val().trim();
    const productstock = $("#stock").val().trim();

    const $messageP = $("#message");

    if (!productname || !productprice || !productpromotion || !productstock) {
        $messageP.text("Please fill all the forms!");
        setTimeout(() => $messageP.text(""), 3000);
        return;
    }

    if (isNaN(productprice) || isNaN(productpromotion) || isNaN(productstock)) {
        alert("Price, Promotion, and Stock must be valid numbers.");
        return;
    }

    if (Number(productprice) < 0 || Number(productpromotion) < 0 || Number(productstock) < 0) {
        $messageP.text("Value cannot be negative");
        setTimeout(() => $messageP.text(""), 2000);
        return;
    }

    const newProduct = {
        name: productname,
        price: parseFloat(productprice).toFixed(2),
        promotion: parseFloat(productpromotion).toFixed(2),
        stock: parseInt(productstock)
    };

    let products = JSON.parse(localStorage.getItem("products")) || [];
    products.push(newProduct);
    localStorage.setItem("products", JSON.stringify(products));

    $messageP.text("Product added successfully!");
    setTimeout(() => $messageP.text(""), 2000);

    updateAdminTableView();  
    displayToCustomer();     

    $("#productname, #productprice, #promotion, #stock").val('');
    clearLowStockAlerts();   
}



function displayToCustomer() {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const $productList = $("#productlist");
    $productList.html("");

    if (products.length === 0) {
        $productList.html("<p>Admin is still working on!</p>");
        return;
    }

    products.forEach((product, index) => {
        const $productItem = $(`
            <div class="product-item">
                <h3>${product.name}</h3>
                <p>Price: $${product.price}</p>
                <p>Promotion: $${product.promotion}</p>
                <p>Stock: ${product.stock}</p>
                <button class="add-to-cart" data-index="${index}">Add to Cart</button>
            </div>
        `);
        $productList.append($productItem);
    });
}



function updateAdminTableView() {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const $table = $("section .products + table");

    $table.find("tr:gt(0)").remove(); 

    products.forEach((product, index) => {
        const $row = $("<tr></tr>").css({
            backgroundColor: "white",
            height: "10vh"
        });

        $row.append($("<td></td>").text(product.name));
        $row.append($("<td></td>").text(product.price));
        $row.append($("<td></td>").text(product.promotion));
        $row.append($("<td></td>").text(product.stock));

        const $deleteBtn = $("<button></button>")
            .text("Delete")
            .css({
                backgroundColor: "red",
                borderRadius: "2px",
                color: "white",
                cursor: "pointer"
            })
            .on("click", () => deleteProductByIndex(index));

        $row.append($("<td></td>").append($deleteBtn));
        $table.append($row);
    });

    clearLowStockAlerts();  
}



function deleteProductByIndex(index) {
    let products = JSON.parse(localStorage.getItem("products")) || [];

    if (index >= 0 && index < products.length) {
        products.splice(index, 1);
        localStorage.setItem("products", JSON.stringify(products));

        $("#message1").text("Product Deleted successfully!");
        setTimeout(() => $("#message1").text(""), 2000);

        updateAdminTableView();
        displayToCustomer();
    } else {
        $("#message1").text("Invalid product index!");
        setTimeout(() => $("#message1").text(""), 2000);
    }
}



function deleteProduct() {
    let products = JSON.parse(localStorage.getItem("products")) || [];

    if (products.length > 0) {
        products.pop();
        localStorage.setItem("products", JSON.stringify(products));
        alert("Last product deleted.");

        updateAdminTableView();
        displayToCustomer();
    } else {
        alert("No products to delete.");
    }
}

function addToCart(index) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    if (index < 0 || index >= products.length) {
        alert("Invalid product.");
        return;
    }

    const product = products[index];
    if (product.stock <= 0) {
        alert("Out of stock.");
        return;
    }

    $("#order").val(product.name);
    $("#price").val(product.price);
    $("#orderForm").show();
    $("#message").text("");
}



function displayOnAdmin() {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
        $("#name").text(userData.name);
        $("#mail").text(userData.phoneNumber);
        $("#address").text(userData.address);
        $("#order").text(userData.order);
        $("#price").text(userData.price);
    } else {
        alert("No customer data found.");
    }
}



function showLowStockAlerts() {
    const lowStockAlerts = JSON.parse(localStorage.getItem("lowStockAlerts")) || [];
    const $messageEl = $("#message");

    if (lowStockAlerts.length > 0) {
        let messageText = "Low stock products:\n";
        lowStockAlerts.forEach(productName => {
            messageText += `- ${productName}\n`;
        });

        $messageEl.html(messageText.replace(/\n/g, "<br>"))
            .css({ color: "orange", fontWeight: "bold" });
    } else {
        $messageEl.text("");
    }
}



function clearLowStockAlerts() {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    let lowStockAlerts = JSON.parse(localStorage.getItem("lowStockAlerts")) || [];

    lowStockAlerts = lowStockAlerts.filter(name => {
        const product = products.find(p => p.name === name);
        return product && product.stock <= 2;
    });

    localStorage.setItem("lowStockAlerts", JSON.stringify(lowStockAlerts));
}



$(function () {
    displayToCustomer();

    $("#productlist").on("click", ".add-to-cart", function () {
        const index = $(this).data("index");
        addToCart(index);
    });

    $("#addProductBtn").on("click", AdminProducts);
    $("#deleteProductBtn").on("click", deleteProduct);

    if (window.location.href.includes("admin.html")) {
        updateAdminTableView();
        displayOnAdmin();
        showLowStockAlerts();
    }

    $("#orderForm").on("submit", function (event) {
        event.preventDefault();

        const name = $("#name").val().trim();
        const phoneNumber = $("#phoneNumber").val().trim();
        const address = $("#address").val().trim();
        const order = $("#order").val();
        const price = $("#price").val();
        const $messageEl = $("#message");

        if (name && phoneNumber && address && order && price) {
            const userData = { name, phoneNumber, address, order, price };
            localStorage.setItem("userData", JSON.stringify(userData));

            let products = JSON.parse(localStorage.getItem("products")) || [];
            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            const productIndex = products.findIndex(p => p.name === order);
            if (productIndex > -1 && products[productIndex].stock > 0) {
                products[productIndex].stock -= 1;
                localStorage.setItem("products", JSON.stringify(products));
            } else {
                $messageEl.css("color", "red").text("Product out of stock.");
                return;
            }

            if (products[productIndex].stock <= 2) {
                let lowStockAlerts = JSON.parse(localStorage.getItem("lowStockAlerts")) || [];
                if (!lowStockAlerts.includes(products[productIndex].name)) {
                    lowStockAlerts.push(products[productIndex].name);
                    localStorage.setItem("lowStockAlerts", JSON.stringify(lowStockAlerts));
                }
            } else {
                let lowStockAlerts = JSON.parse(localStorage.getItem("lowStockAlerts")) || [];
                lowStockAlerts = lowStockAlerts.filter(name => name !== products[productIndex].name);
                localStorage.setItem("lowStockAlerts", JSON.stringify(lowStockAlerts));
            }

            const cartIndex = cart.findIndex(item => item.name === order);
            if (cartIndex > -1) {
                cart[cartIndex].quantity += 1;
            } else {
                cart.push({ name: order, price: price, quantity: 1 });
            }
            localStorage.setItem("cart", JSON.stringify(cart));

            $messageEl.css("color", "white").text(`${order} added to cart.`);

            updateAdminTableView();
            displayToCustomer();

            setTimeout(() => {
                $("#orderForm").hide();
                $("#name, #phoneNumber, #address").val('');
                $messageEl.text('');
                window.location.href = "admin.html";
            }, 2000);

        } else {
            $messageEl.css("color", "red").text("All fields are required.");
        }
    });

    $("#orderForm").hide();
});
function promotion() {
  const products = JSON.parse(localStorage.getItem("products")) || [];

  const promotionTable = document.querySelector("#promotionTable");

  if (!promotionTable) return;

  while (promotionTable.rows.length > 1) {
    promotionTable.deleteRow(1);
  }

  products.forEach(product => {
    const row = promotionTable.insertRow();
    row.insertCell(0).innerText = product.name || "";

    const productpromotion = $("#promotion").val().trim();



    row.insertCell(1).innerText = product.promotion; // Promotion (%)




    const today = new Date();
const threeDaysLater = new Date();
threeDaysLater.setDate(today.getDate() + 3);

const formatDate = (date) => date.toISOString().split('T')[0];

    row.insertCell(2).innerText = formatDate(today); // Start Date
    row.insertCell(3).innerText = formatDate(threeDaysLater); // End Date
    row.insertCell(4).innerText = "active"; // Status
  });
}

document.addEventListener("DOMContentLoaded", promotion);
