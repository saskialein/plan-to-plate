# Use the official PostgreSQL base image
FROM postgres:12

# Install PGVector extension dependencies
RUN apt-get update && apt-get install -y \
    postgresql-server-dev-12 \
    build-essential \
    git \
    && apt-get clean

# Clone the PGVector repository and install it
RUN git clone https://github.com/pgvector/pgvector.git /usr/src/pgvector
WORKDIR /usr/src/pgvector
RUN make && make install

# Clean up
RUN rm -rf /usr/src/pgvector