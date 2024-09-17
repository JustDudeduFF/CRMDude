import React from 'react'

export default function SubscriberLogs() {
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{flex:'2'}}>
        <h2>Subscriber Logs</h2>

      </div>

      <div style={{flex:'10'}}>
        <table className='table'>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Update By</th>
            </tr>
          </thead>

        </table>

      </div>

    </div>
  )
}
