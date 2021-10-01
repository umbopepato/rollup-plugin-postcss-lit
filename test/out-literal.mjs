import { css } from 'lit';

var test = css`.test {
    color: white;
    background: url("./test.jpg");
}

.test:after {
    content: "\\2014";
}
`;

export default test;
