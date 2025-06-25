import React from 'react';

import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const cards = [
    {
      title: 'Ürün Yönetimi',
      desc: 'Ürün Ekle, görüntüle',
      button: 'Ürünlere Git',
      to: '/products',
    },
    {
      title: 'Kategori Yönetimi',
      desc: 'Kategori ekle, görüntüle',
      button: 'Kategoriler',
      to: '/categories',
    },
    {
      title: 'Talep Tahminleri',
      desc: 'Ürün bazlı tahmin al',
      button: 'Tahmin Yap',
      to: '/forecasts',
    },
    {
      title: 'Satışlar',
      desc: 'Geçmiş satışları görüntüle',
      button: 'Satışlara Git',
      to: '/sales',
    },
  ];
  React.useEffect(() => {
    document.body.style.background = '#EBEBEB';
    return () => { document.body.style.background = ''; };
  }, []);

  return (
    <div style={{
      maxWidth:540,
      margin:'0 auto',
      padding:'2em 0',
      fontFamily: 'Rubik'
    }}>
      <h1 style={{textAlign:'center',marginBottom:'2em', fontSize:'2.6em'}}>Stok Analiz</h1>
      <div style={{display:'flex',flexDirection:'column',gap:'2em'}}>
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() => navigate(card.to)}
            style={{
              cursor:'pointer',
              background:'#F7F7FF',
              border:'1px solid #e0e0e0',
              borderRadius:18,
              boxShadow:'0 2px 16px #0001',
              padding:'2em',
              display:'flex',
              alignItems:'center',
              gap:'2em',
              transition:'box-shadow .2s',
              fontSize:'1.2em',
            }}
            onMouseOver={e => e.currentTarget.style.boxShadow='0 4px 32px #0002'}
            onMouseOut={e => e.currentTarget.style.boxShadow='0 2px 16px #0001'}
          >
            <div style={{flex:1}}>
              <div style={{fontWeight:'bold',fontSize:'1.25em',marginBottom:'.3em'}}>{card.title}</div>
              <div style={{color:'#666',marginBottom:'1em'}}>{card.desc}</div>
              <button
                style={{
                  fontSize:'1em',
                  padding:'0.7em 1.5em',
                  border:'none',
                  borderRadius:8,
                  background:'#10B981',
                  color:'#fff',
                  cursor:'pointer',
                  fontWeight:'bold',
                  boxShadow:'0 1px 7px #1976d222',
                }}
                onClick={e => {e.stopPropagation();navigate(card.to);}}
              >{card.button}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
