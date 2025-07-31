import { Card, CardContent } from './card';

export function CompanyValues() {
  const values = [
    { title: 'Integrity', description: 'We uphold the highest standards of integrity in all our actions.' },
    { title: 'Innovation', description: 'We strive to innovate and improve continuously.' },
    { title: 'Teamwork', description: 'We work together to meet the needs of our customers and help the company win.' },
    { title: 'Customer Focus', description: 'We value our customers and are committed to their success.' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {values.map((value, index) => (
        <div key={index}>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-bold">{value.title}</h3>
              <p className="text-sm text-gray-600">{value.description}</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
