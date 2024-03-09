import React from 'react';
// import Iframe from 'react-iframe'

export default function Statistics() {

    const totalUsersChart = '<iframe width="389" height="320" style="background: #FFFFFF; border: none; border-radius: 2px; box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" src="https://charts.mongodb.com/charts-tms-ynsiy/embed/charts?id=604fd538-a165-4f51-9786-42c9c5adfef3&autoRefresh=3600&theme=light"></iframe>'; 
    const totalThesesChart = '<iframe width="389" height="320" style="background: #FFFFFF; border: none; border-radius: 2px; box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" src="https://charts.mongodb.com/charts-tms-ynsiy/embed/charts?id=a09a52fd-4cab-4049-bc8a-999e86451856&autoRefresh=3600&theme=light"></iframe>'; 
    const totalRequestsChart = '<iframe width="388" height="320" style="background: #FFFFFF; border: none; border-radius: 2px; box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" src="https://charts.mongodb.com/charts-tms-ynsiy/embed/charts?id=ba040373-2ce4-4670-9196-b40930c6015c&autoRefresh=3600&theme=light"></iframe>'; 

    const thesesAreaChart = '<iframe width="1247" height="440" style="background: #FFFFFF; border: none; border-radius: 2px; box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" src="https://charts.mongodb.com/charts-tms-ynsiy/embed/charts?id=a9fd7fab-da0b-45ab-9974-2312fa7e4619&autoRefresh=3600&theme=light"></iframe>';
    
    const usersGroupChart = '<iframe width="603" height="380" style="background: #FFFFFF;border: none;border-radius: 2px;box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" src="https://charts.mongodb.com/charts-tms-ynsiy/embed/charts?id=f7a794e8-fc0a-4ac3-90ef-e67657a3baa0&autoRefresh=3600&theme=light"></iframe>';
    const thesesGroupChart = '<iframe width="603" height="380" style="background: #FFFFFF;border: none;border-radius: 2px;box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" src="https://charts.mongodb.com/charts-tms-ynsiy/embed/charts?id=37d2f454-25f9-49a1-a4dd-b97abd7f5cf6&autoRefresh=3600&theme=light"></iframe>'

    function renderCharts() {
        return (
            <div className="statistics">
                <div className="row" style={{ overflowX: "auto" }}>
                    <div className="col mt-2" dangerouslySetInnerHTML={{ __html: totalUsersChart }}></div>
                    <div className="col mt-2" dangerouslySetInnerHTML={{ __html: totalThesesChart }}></div>
                    <div className="col mt-2" dangerouslySetInnerHTML={{ __html: totalRequestsChart }}></div>
                </div>
                <div className="row" style={{ overflowX: "auto" }}>
                    <div className="col mt-4 mb-2" dangerouslySetInnerHTML={{ __html: thesesAreaChart }}></div>
                </div>
                <div className="row" style={{ overflowX: "auto" }}>
                    <div className="col mt-4 mb-2" dangerouslySetInnerHTML={{ __html: usersGroupChart }}></div>
                    <div className="col mt-4 mb-2" dangerouslySetInnerHTML={{ __html: thesesGroupChart }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="stats-wrapper">
            <h5>MongoDB Charts</h5>
            <div id="chart"></div>
            {
                renderCharts()
            }
        </div>
    )
}
