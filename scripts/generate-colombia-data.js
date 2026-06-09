async function test() {
    const response = await fetch(
        'https://raw.githubusercontent.com/proyecto26/colombia/master/data/colombia.min.json'
    );

    const text = await response.text();

    console.log(text.substring(0, 500));
}

test();